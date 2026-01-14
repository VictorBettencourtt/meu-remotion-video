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
        // Resolução 4K para o zoom não perder qualidade
        await page.setViewport({ width: 2560, height: 1440, deviceScaleFactor: 2 });
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Limpa a tela do GitHub pra focar só no n8n
        await page.addStyleTag({ content: `
            .Header, .gh-header, .js-header-back-to-top, .Box-header, 
            .discussion-sidebar, .review-thread-reply, .TimelineItem-badge { display: none !important; }
            .comment-body { padding: 50px !important; background: white !important; }
        `});

        const element = await page.$('.comment-body');
        if (element) {
            await element.screenshot({ path: filePath });
        } else {
            await page.screenshot({ path: filePath, fullPage: true });
        }

        await browser.close();
        return fileName;
    } catch (e) {
        await browser.close();
        throw e;
    }
}

async function downloadMedia(url, name) {
    if (!url || url === "" || url === "N/A") return "";
    const filePath = path.join(publicPath, name);
    const writer = fs.createWriteStream(filePath);
    const response = await axios({ url, method: 'GET', responseType: 'stream', headers: { 'User-Agent': 'Mozilla/5.0' } });
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
            finalMediaFile = await takeScreenshot(screenshotUrl, 'n8n-canvas');
        } else {
            finalMediaFile = await downloadMedia(videoUrl, `input-v-${Date.now()}.mp4`);
        }
        const audioFile = await downloadMedia(backgroundMusicUrl, `input-a-${Date.now()}.mp4`);
        const bundleLocation = await bundle(path.resolve('./src/index.ts'));
        const inputProps = { videoUrl: finalMediaFile, title, backgroundMusicUrl: audioFile, isImage: !!screenshotUrl };
        const composition = await selectComposition({ serveUrl: bundleLocation, id: compositionId, inputProps });
        const outputName = `final-${Date.now()}.mp4`;
        await renderMedia({ composition, serveUrl: bundleLocation, codec: 'h264', outputLocation: path.resolve(outputName), inputProps });
        res.send({ message: 'Renderizado!', url: `https://automarketing-remotion.ykfift.easypanel.host/outputs/${outputName}` });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.listen(3000, '0.0.0.0', () => console.log(`Servidor de Mídia pronto`));
