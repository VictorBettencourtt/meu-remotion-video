const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use('/outputs', express.static(path.resolve('./')));

// Garante que a pasta public existe para o Remotion enxergar os arquivos
const publicPath = path.resolve('./public');
if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath);
}

async function downloadMedia(url, name) {
    const filePath = path.join(publicPath, name); // Salva dentro de /public
    const writer = fs.createWriteStream(filePath);
    const response = await axios({ url, method: 'GET', responseType: 'stream' });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(name)); // Retorna só o nome do arquivo
        writer.on('error', reject);
    });
}

app.post('/render', async (req, res) => {
    const { videoUrl, title, backgroundMusicUrl } = req.body;
    const compositionId = 'MeuVideoPrincipal';

    try {
        console.log('Baixando arquivos na pasta public...');
        const videoFile = await downloadMedia(videoUrl, `input-video-${Date.now()}.mp4`);
        const audioFile = await downloadMedia(backgroundMusicUrl, `input-audio-${Date.now()}.mp4`);

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

        const fileName = `final-${Date.now()}.mp4`;
        const outputLocation = path.resolve(fileName);

        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation: outputLocation,
            inputProps,
        });

        console.log('Render concluído:', fileName);
        res.send({ 
            message: 'Renderizado!', 
            url: `https://automarketing-remotion.ykfift.easypanel.host/outputs/${fileName}` 
        });

    } catch (error) {
        console.error('Erro no render:', error);
        res.status(500).send({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Servidor Remotion pronto na porta ${PORT}`));