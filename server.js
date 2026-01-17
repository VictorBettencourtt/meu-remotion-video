const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use('/outputs', express.static(path.resolve('./')));

const publicPath = path.resolve('./public');
if (!fs.existsSync(publicPath)) fs.mkdirSync(publicPath);

async function downloadMedia(url, name) {
    if (!url || url === "" || url === "N/A") return "";
    const filePath = path.join(publicPath, name);
    const writer = fs.createWriteStream(filePath);
    const response = await axios({ 
        url, 
        method: 'GET', 
        responseType: 'stream',
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(name));
        writer.on('error', reject);
    });
}

app.post('/render', async (req, res) => {
    const { videoUrl, title, backgroundMusicUrl, compositionId = 'MasterShort' } = req.body;
    try {
        console.log('Baixando arquivos...');
        const videoFile = await downloadMedia(videoUrl, `input-v-${Date.now()}.mp4`);
        const audioFile = await downloadMedia(backgroundMusicUrl, `input-a-${Date.now()}.mp4`);

        const bundleLocation = await bundle(path.resolve('./src/index.ts'));

        const inputProps = { 
            videoUrl: videoFile, 
            title, 
            backgroundMusicUrl: audioFile 
        };

        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: compositionId,
            inputProps,
        });

        const outputName = `final-${Date.now()}.mp4`;
        const outputLocation = path.resolve(outputName);

        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation: outputLocation,
            inputProps,
        });

        res.send({ 
            message: 'Renderizado!', 
            url: `https://automarketing-remotion.ykfift.easypanel.host/outputs/${outputName}` 
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
});

app.listen(3000, '0.0.0.0', () => console.log(`Servidor pronto na porta 3000`));