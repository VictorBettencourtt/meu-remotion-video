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

app.post('/render', async (req, res) => {
    const { videoUrl, title, backgroundMusicUrl, narrationUrl, compositionId = 'MasterShort', durationInFrames } = req.body;
    
    let videoFile = '';
    let audioFile = '';
    let narrationFile = '';

    try {
        console.log(`--- Iniciando Renderização Vision: ${compositionId} ---`);
        
        if (videoUrl) videoFile = await downloadMedia(videoUrl, `v-${Date.now()}`);
        if (backgroundMusicUrl) audioFile = await downloadMedia(backgroundMusicUrl, `a-${Date.now()}`);
        if (narrationUrl) narrationFile = await downloadMedia(narrationUrl, `n-${Date.now()}`);

        const bundleLocation = await bundle({
            entryPoint: path.resolve('./src/index.ts'),
        });

        const isImage = videoFile.endsWith('.png') || videoFile.endsWith('.jpg') || videoFile.endsWith('.jpeg');

        const inputProps = { 
            videoUrl: videoFile, 
            title: title || "Sem título", 
            backgroundMusicUrl: audioFile,
            narrationUrl: narrationFile,
            isImage: isImage
        };

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
            concurrency: 4,
            downloadBehavior: { concurrency: 5 },
            onProgress: ({ progress }) => {
                console.log(`Render: ${(progress * 100).toFixed(0)}%`);
            }
        });

        setTimeout(() => {
            [videoFile, audioFile, narrationFile].forEach(f => {
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
    }
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(3000, '0.0.0.0', () => console.log(`Remotion Factory Vision v3.0 on port 3000`));