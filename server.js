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

async function downloadMedia(url, nameWithoutExtension) {
    if (!url || url === "" || url === "N/A") return "";
    
    // Detecta se é imagem ou vídeo pelo link ou pelo conteúdo
    const isImage = url.includes('assets') || url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
    const extension = isImage ? '.png' : '.mp4';
    const fileName = `${nameWithoutExtension}${extension}`;
    const filePath = path.join(publicPath, fileName);
    
    const writer = fs.createWriteStream(filePath);
    const response = await axios({ 
        url, 
        method: 'GET', 
        responseType: 'stream',
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(fileName));
        writer.on('error', reject);
    });
}

async function takeScreenshot(url, name) {
    const fileName = `${name}-${Date.now()}.png`;
    const filePath = path.join(publicPath, fileName);
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.addStyleTag({ content: '.Header, .gh-header { display: none !important; }' });
        const element = await page.$('.comment-body');
        if (element) await element.screenshot({ path: filePath });
        else await page.screenshot({ path: filePath });
        await browser.close();
        return fileName;
    } catch (e) {
        await browser.close();
        throw e;
    }
}

app.post('/render', async (req, res) => {
    const { videoUrl, title, backgroundMusicUrl, screenshotUrl, compositionId = 'MasterShort' } = req.body;
    try {
        let finalMediaFile = "";
        let isActuallyImage = false;

        if (screenshotUrl) {
            finalMediaFile = await takeScreenshot(screenshotUrl, 'n8n-print');
            isActuallyImage = true;
        } else {
            // Se o link de vídeo na verdade for uma imagem do GitHub Assets
            isActuallyImage = videoUrl.includes('assets') || videoUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i);
            finalMediaFile = await downloadMedia(videoUrl, `input-${Date.now()}`);
        }

        const audioFile = await downloadMedia(backgroundMusicUrl, `audio-${Date.now()}`);
        const bundleLocation = await bundle(path.resolve('./src/index.ts'));

        const inputProps = { 
            videoUrl: finalMediaFile, 
            title, 
            backgroundMusicUrl: audioFile, 
            isImage: isActuallyImage 
        };

        const composition = await selectComposition({ serveUrl: bundleLocation, id: compositionId, inputProps });
        const outputName = `final-${Date.now()}.mp4`;

        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation: path.resolve(outputName),
            inputProps,
        });

        res.send({ message: 'Renderizado!', url: `https://automarketing-remotion.ykfift.easypanel.host/outputs/${outputName}` });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
});

app.listen(3000, '0.0.0.0', () => console.log(`Servidor pronto`));