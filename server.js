const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());
app.use('/outputs', express.static(path.resolve('./')));

const publicPath = path.resolve('./public');
if (!fs.existsSync(publicPath)) fs.mkdirSync(publicPath);

async function takeScreenshot(url, fileName) {
    const filePath = path.join(publicPath, fileName);
    console.log(`[PUPPETEER] Tirando print de: ${url}`);
    
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: "new"
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 2000 });
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Esconder elementos de UI do GitHub para foco no código/PR
        await page.addStyleTag({
            content: `
                .Header, .gh-header, .js-header-wrapper, 
                .footer, .AppHeader, #repository-container-header {
                    display: none !important;
                }
                body {
                    background-color: #0d1117 !important;
                }
            `
        });

        // Aguarda um pouco para o CSS ser aplicado e a página estabilizar
        await new Promise(r => setTimeout(r, 2000));

        await page.screenshot({ path: filePath, fullPage: false });
        console.log(`[PUPPETEER] Print salvo: ${fileName}`);
        return fileName;
    } finally {
        await browser.close();
    }
}

async function downloadMedia(url, baseName) {
    if (!url || url === "" || url === "N/A") return "";
    
    const urlPath = url.split('?')[0];
    let detectedExt = path.extname(urlPath).toLowerCase();
    
    const validExtensions = ['.mp4', '.mov', '.mp3', '.wav', '.jpg', '.jpeg', '.png', '.webp', '.avif'];
    
    // Se for link do GitHub ou não tiver extensão de mídia, tratamos como Screenshot
    if (url.includes('github.com') || !validExtensions.includes(detectedExt)) {
        if (!detectedExt || !['.mp3', '.wav'].includes(detectedExt)) {
            return await takeScreenshot(url, `v-${Date.now()}.png`);
        }
    }

    const fileName = `${baseName}${detectedExt}`;
    const filePath = path.join(publicPath, fileName);
    
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            timeout: 60000,
        });

        fs.writeFileSync(filePath, Buffer.from(response.data));
        return fileName;
    } catch (error) {
        console.error(`[FACTORY] Erro no download: ${error.message}`);
        throw error;
    }
}

let isRendering = false;

app.post('/render', async (req, res) => {
    if (isRendering) {
        console.log('[API] Concorrência bloqueada: servidor já está renderizando.');
        return res.status(429).send({ error: "Servidor já está ocupado renderizando um vídeo." });
    }
    
    isRendering = true;
    const {
        videoUrl, title, backgroundMusicUrl, narrationUrl, compositionId = 'MasterShort', durationInFrames, captionText, caption, captions,
        // Campos específicos do TripleClip (Gancho + Conteúdo + CTA em um vídeo só)
        ganchoUrl, ganchoTempo, conteudoUrl, conteudoTempo, ctaUrl, ctaTempo,
    } = req.body;

    let videoFile = '';
    let audioFile = '';
    let narrationFile = '';
    let ganchoFile = '';
    let conteudoFile = '';
    let ctaFile = '';

    try {
        console.log(`--- Iniciando Renderização Vision: ${compositionId} ---`);

        if (backgroundMusicUrl) audioFile = await downloadMedia(backgroundMusicUrl, `a-${Date.now()}`);
        if (narrationUrl) narrationFile = await downloadMedia(narrationUrl, `n-${Date.now()}`);

        let inputProps;

        if (compositionId === 'TripleClip') {
            // Baixa os 3 clipes em sequência (o servidor não tem fila/concorrência de render,
            // então não há ganho em paralelizar aqui além do que axios já faz por request).
            if (ganchoUrl) ganchoFile = await downloadMedia(ganchoUrl, `g-${Date.now()}`);
            if (conteudoUrl) conteudoFile = await downloadMedia(conteudoUrl, `c-${Date.now()}`);
            if (ctaUrl) ctaFile = await downloadMedia(ctaUrl, `cta-${Date.now()}`);

            inputProps = {
                ganchoUrl: ganchoFile,
                ganchoTempo: ganchoTempo ? parseFloat(ganchoTempo) : undefined,
                conteudoUrl: conteudoFile,
                conteudoTempo: conteudoTempo ? parseFloat(conteudoTempo) : undefined,
                ctaUrl: ctaFile,
                ctaTempo: ctaTempo ? parseFloat(ctaTempo) : undefined,
                title: title || "",
                backgroundMusicUrl: audioFile,
                narrationUrl: narrationFile,
            };
        } else {
            if (videoUrl) videoFile = await downloadMedia(videoUrl, `v-${Date.now()}`);
            const isImage = videoFile.endsWith('.png') || videoFile.endsWith('.jpg') || videoFile.endsWith('.jpeg');

            inputProps = {
                videoUrl: videoFile,
                title: title || "Sem título",
                backgroundMusicUrl: audioFile,
                narrationUrl: narrationFile,
                isImage: isImage,
                captionText: captionText,
                caption: caption,
                captions: captions,
                durationInFrames: durationInFrames ? parseInt(durationInFrames) : undefined
            };
        }

        const bundleLocation = await bundle({
            entryPoint: path.resolve('./src/index.ts'),
        });

        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: compositionId,
            inputProps,
            durationInFrames: durationInFrames ? parseInt(durationInFrames) : undefined,
        });

        const outputName = `render-${Date.now()}.mp4`;
        const outputLocation = path.resolve(outputName);

        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation: outputLocation,
            inputProps,
            concurrency: 6, // Servidor parrudo, vamos devorar os núcleos para acelerar
            crf: 28, 
            x264Preset: 'superfast', 
            downloadBehavior: { concurrency: 6 }, // Acelera cache
            onProgress: ({ progress }) => {
                console.log(`Render: ${(progress * 100).toFixed(0)}%`);
            }
        });

        setTimeout(() => {
            [videoFile, audioFile, narrationFile, ganchoFile, conteudoFile, ctaFile].forEach(f => {
                if (f) {
                    const p = path.join(publicPath, f);
                    try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch(e) {}
                }
            });
        }, 10000);

        res.send({ 
            success: true, 
            url: `https://automarketing-remotion.ykfift.easypanel.host/outputs/${outputName}` 
        });

    } catch (error) {
        console.error('[ERRO VISION]', error.message);
        res.status(500).send({ 
            error: error.message,
            details: "Falha ao processar URL ou capturar screenshot."
        });
    } finally {
        isRendering = false;
        console.log(`--- Renderização Concluída/Encerrada ---`);
    }
});


app.post('/render-timeline', async (req, res) => {
    const expectedToken = process.env.REMOTION_API_KEY;
    const suppliedToken = String(req.headers.authorization || '').replace(/^Bearer\\s+/i, '');
    const suppliedBuffer = Buffer.from(suppliedToken);
    const expectedBuffer = Buffer.from(expectedToken || '');
    if (!expectedToken || suppliedBuffer.length !== expectedBuffer.length ||
        !require('crypto').timingSafeEqual(suppliedBuffer, expectedBuffer)) {
        return res.status(401).send({ error: "Não autorizado." });
    }
    if (isRendering) {
        return res.status(429).send({ error: "Servidor já está ocupado renderizando um vídeo." });
    }

    isRendering = true;
    const { timeline, output = {} } = req.body || {};
    const createdFiles = [];
    try {
        if (!timeline || !Array.isArray(timeline.tracks)) {
            return res.status(400).send({ error: "Payload inválido: envie timeline.tracks." });
        }

        const allClips = timeline.tracks.flatMap(track => track.clips || []);
        let totalBytes = 0;
        const allowedHost = (host) =>
            host === 'drive.google.com' ||
            host === 'googleusercontent.com' || host.endsWith('.googleusercontent.com') ||
            host === 'replicate.delivery' || host.endsWith('.replicate.delivery');

        const downloadAllowedMedia = async (inputUrl) => {
            let currentUrl = inputUrl;
            for (let redirect = 0; redirect <= 5; redirect++) {
                const parsed = new URL(currentUrl);
                if (parsed.protocol !== 'https:' || !allowedHost(parsed.hostname.toLowerCase())) {
                    throw new Error('Origem de mídia não permitida.');
                }
                const response = await axios({
                    url: currentUrl,
                    method: 'GET',
                    responseType: 'arraybuffer',
                    timeout: 120000,
                    maxRedirects: 0,
                    maxContentLength: 150 * 1024 * 1024,
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                    validateStatus: status => status >= 200 && status < 400,
                });
                if (response.status >= 300 && response.status < 400) {
                    const location = response.headers.location;
                    if (!location || redirect === 5) throw new Error('Redirecionamento de mídia inválido.');
                    currentUrl = new URL(location, currentUrl).toString();
                    continue;
                }
                const bytes = Buffer.from(response.data);
                totalBytes += bytes.length;
                if (totalBytes > 400 * 1024 * 1024) throw new Error('A soma das mídias excede o limite de 400 MB.');
                return { bytes, mime: String(response.headers['content-type'] || '').split(';')[0].toLowerCase() };
            }
            throw new Error('Não foi possível baixar a mídia.');
        };

        for (let i = 0; i < allClips.length; i++) {
            const clip = allClips[i];
            const asset = clip.asset || {};
            if (!['video', 'image', 'audio'].includes(asset.type) || !asset.src || String(asset.src).startsWith('alias://')) continue;

            const { bytes, mime } = await downloadAllowedMedia(asset.src);
            const extByMime = {
                'video/mp4': '.mp4', 'video/quicktime': '.mov', 'video/webm': '.webm',
                'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
                'audio/wav': '.wav', 'audio/x-wav': '.wav', 'audio/mpeg': '.mp3',
                'audio/mp4': '.m4a', 'audio/ogg': '.ogg',
            };
            const fallbackExt = asset.type === 'video' ? '.mp4' : asset.type === 'image' ? '.jpg' : '.wav';
            const ext = extByMime[mime] || fallbackExt;
            const fileName = `timeline-${Date.now()}-${i}${ext}`;
            fs.writeFileSync(path.join(publicPath, fileName), bytes);
            createdFiles.push(fileName);
            asset.src = fileName;
        }

        const fps = Number(output.fps) || 30;
        const width = Number(output.size?.width) || 1920;
        const height = Number(output.size?.height) || 1080;
        const inputProps = { timeline, fps, width, height };
        const bundleLocation = await bundle({ entryPoint: path.resolve('./src/index.ts') });
        const composition = await selectComposition({ serveUrl: bundleLocation, id: 'Timeline', inputProps });
        const outputName = `psychedepth-${Date.now()}.mp4`;
        const outputLocation = path.resolve(outputName);
        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation,
            inputProps,
            concurrency: 6,
            crf: 28,
            x264Preset: 'superfast',
            downloadBehavior: { concurrency: 6 },
            onProgress: ({ progress }) => console.log(`Timeline render: ${(progress * 100).toFixed(0)}%`),
        });

        res.send({ success: true, url: `https://automarketing-remotion.ykfift.easypanel.host/outputs/${outputName}` });
    } catch (error) {
        console.error('[ERRO REMOTION TIMELINE]', error.message);
        res.status(500).send({ error: error.message, details: "Falha ao baixar mídias ou renderizar a timeline." });
    } finally {
        setTimeout(() => {
            createdFiles.forEach(file => {
                try {
                    const filePath = path.join(publicPath, file);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                } catch (e) {}
            });
        }, 10000);
        isRendering = false;
    }
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(3000, '0.0.0.0', () => console.log(`Remotion Factory Vision v3.0 on port 3000`));