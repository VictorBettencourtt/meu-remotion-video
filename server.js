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

async function downloadMedia(url, nameWithoutExt) {
    if (!url || url === "" || url === "N/A") return { file: "", isImage: false };
    
    const response = await axios({ 
        url, method: 'GET', responseType: 'stream',
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    // Pega o tipo real do arquivo (image/png, video/mp4, etc)
    const contentType = response.headers['content-type'] || "";
    const isActuallyImage = contentType.includes('image') || url.includes('assets');
    const extension = isActuallyImage ? '.png' : '.mp4';
    const fileName = `${nameWithoutExt}${extension}`;
    const filePath = path.join(publicPath, fileName);

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve({ file: fileName, isImage: isActuallyImage }));
        writer.on('error', reject);
    });
}

app.post('/render', async (req, res) => {
    const { videoUrl, title, backgroundMusicUrl, screenshotUrl, compositionId = 'MasterShort' } = req.body;
    try {
        let finalMedia = { file: "", isImage: false };
        
        if (screenshotUrl) {
            const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
            const page = await browser.newPage();
            const fileName = `print-${Date.now()}.png`;
            await page.setViewport({ width: 1920, height: 1080 });
            await page.goto(screenshotUrl, { waitUntil: 'networkidle2' });
            await page.screenshot({ path: path.join(publicPath, fileName) });
            await browser.close();
            finalMedia = { file: fileName, isImage: true };
        } else {
            finalMedia = await downloadMedia(videoUrl, `input-${Date.now()}`);
        }

        const audio = await downloadMedia(backgroundMusicUrl, `audio-${Date.now()}`);
        const bundleLocation = await bundle(path.resolve('./src/index.ts'));

        const inputProps = { 
            videoUrl: finalMedia.file, 
            title, 
            backgroundMusicUrl: audio.file, 
            isImage: finalMedia.isImage 
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