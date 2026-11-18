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


const { execFileSync } = require('child_process');
const crypto = require('crypto');
app.post('/render/prime-report', async (req, res) => {
    const expectedToken = process.env.PRIME_REPORT_RENDER_TOKEN;
    const providedToken = String(req.get('x-prime-token') || '');
    if (!expectedToken || expectedToken.length < 32 || Buffer.byteLength(providedToken) !== Buffer.byteLength(expectedToken) || !crypto.timingSafeEqual(Buffer.from(providedToken), Buffer.from(expectedToken))) return res.status(401).json({error: 'Acesso não autorizado'});
    if (isRendering) return res.status(429).json({error: 'Servidor ocupado'});
    const timeline = req.body?.data?.timeline;
    const tracks = timeline?.tracks;
    if (!Array.isArray(tracks) || tracks.length < 4 || !Array.isArray(tracks[2]?.clips) || tracks[2].clips.length === 0 || !tracks[3]?.clips?.[0]?.asset?.src) {
        return res.status(400).json({error: 'Linha do tempo inválida'});
    }
    isRendering = true;
    const jobId = Date.now() + '-' + Math.random().toString(36).slice(2, 10);
    const jobDir = path.join(publicPath, 'prime-' + jobId);
    const files = [];
    try {
        fs.mkdirSync(jobDir, {recursive: true});
        async function getAsset(url, name, allowedTypes) {
            const parsed = new URL(url);
            const allowedHosts = new Set(['automatizze.ia.br', 'automarketing-wordpress.ykfift.easypanel.host', 'drive.google.com', 'prod-1.storage.jamendo.com']);
            if (parsed.protocol !== 'https:' || !allowedHosts.has(parsed.hostname) || parsed.port || parsed.username || parsed.password) throw new Error('Origem de mídia não permitida');
            const response = await axios.get(url, {responseType: 'arraybuffer', timeout: 60000, maxRedirects: 0, maxContentLength: 20 * 1024 * 1024, headers: {'User-Agent': 'Mozilla/5.0'}});
            const contentType = String(response.headers['content-type'] || '').toLowerCase();
            if (!allowedTypes.some(type => contentType.startsWith(type))) throw new Error('Formato de mídia inválido para ' + name);
            fs.writeFileSync(path.join(jobDir, name), response.data);
            files.push(name);
            return 'prime-' + jobId + '/' + name;
        }
        const voice = await getAsset(tracks[3].clips[0].asset.src, 'voice.mp3', ['audio/','application/octet-stream']);
        const music = timeline.soundtrack?.src ? await getAsset(timeline.soundtrack.src, 'music.mp3', ['audio/','application/octet-stream']) : '';
        const logo = tracks[0]?.clips?.[0]?.asset?.src ? await getAsset(tracks[0].clips[0].asset.src, 'logo.png', ['image/']) : '';
        const images = [];
        for (const [index, clip] of tracks[2].clips.entries()) images.push(await getAsset(clip.asset.src, 'image-' + index, ['image/']));
        const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', path.join(jobDir, 'voice.mp3')], {encoding: 'utf8'}).trim());
        if (!Number.isFinite(duration) || duration <= 0 || duration > 900) throw new Error('Duração da narração inválida');
        const headlines = (tracks[1]?.clips || []).map(c => ({text: String(c.asset?.html || '').match(/<p[^>]*>([\\s\\S]*?)<\\/p>/i)?.[1]?.replace(/<[^>]+>/g, '') || '', start: Number(c.start), length: Number(c.length)})).filter(c => c.text && Number.isFinite(c.start) && Number.isFinite(c.length));
        const inputProps = {images, voice, music, logo, headlines, durationInFrames: Math.ceil((duration + 0.8) * 30)};
        const serveUrl = await bundle({entryPoint: path.resolve('./src/index.ts')});
        const composition = await selectComposition({serveUrl, id: 'PrimeReport', inputProps});
        const outputName = 'prime-report-' + jobId + '.mp4';
        await renderMedia({composition, serveUrl, codec: 'h264', outputLocation: path.resolve(outputName), inputProps, concurrency: 2, crf: 24, x264Preset: 'superfast'});
        res.json({success: true, url: 'https://automarketing-remotion.ykfift.easypanel.host/outputs/' + outputName, duration});
    } catch (error) {
        console.error('[PRIME REPORT]', error.message);
        res.status(500).json({error: error.message});
    } finally {
        fs.rmSync(jobDir, {recursive: true, force: true});
        isRendering = false;
    }
});

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

app.get('/health', (req, res) => res.send('OK'));

app.listen(3000, '0.0.0.0', () => console.log(`Remotion Factory Vision v3.0 on port 3000`));