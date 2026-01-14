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

async function takeScreenshot(url, name) {
    const fileName = `${name}-${Date.now()}.png`;
    const filePath = path.join(publicPath, fileName);
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.addStyleTag({ content: '.Header, .js-header-back-to-top { display: none !important; }' });
        await page.screenshot({ path: filePath });
        await browser.close();
        return fileName;
    } catch (e) {
        await browser.close();
        throw e;
    }
}

async function downloadMedia(url, name) {
    if (!url || url === "") return "";
    const filePath = path.join(publicPath, name);
    const writer = fs.createWriteStream(filePath);
    const response = await axios({ url, method: 'GET', responseType: 'stream' });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(name));
        writer.on('error', reject);
    });
}

app.post('/render', async (req, res) => {
    const { videoUrl, title, backgroundMusicUrl, screenshotUrl, compositionId = 'MasterShort' } = req.body;
    try {
        let finalMediaFile = "";
        if (screenshotUrl) {
            finalMediaFile = await takeScreenshot(screenshotUrl, 'web-print');
        } else {
            finalMediaFile = await downloadMedia(videoUrl, `input-v-${Date.now()}.mp4`);
        }
        const audioFile = await downloadMedia(backgroundMusicUrl, `input-a-${Date.now()}.mp4`);
        const bundleLocation = await bundle(path.resolve('./src/index.ts'));
        const inputProps = { videoUrl: finalMediaFile, title, backgroundMusicUrl: audioFile, isImage: !!screenshotUrl };
        const composition = await selectComposition({ serveUrl: bundleLocation, id: compositionId, inputProps });
        const outputName = `final-${Date.now()}.mp4`;
        const outputLocation = path.resolve(outputName);
        await renderMedia({ composition, serveUrl: bundleLocation, codec: 'h264', outputLocation, inputProps });
        res.send({ message: 'Renderizado!', url: `https://automarketing-remotion.ykfift.easypanel.host/outputs/${outputName}` });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.listen(3000, '0.0.0.0', () => console.log(`Servidor pronto na porta 3000`));
