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
    const { videoUrl, title, backgroundMusicUrl, narrationUrl, compositionId = 'MasterShort' } = req.body;
    
    let videoFile = '';
    let audioFile = '';
    let narrationFile = '';

    try {
        console.log('Baixando arquivos...');
        videoFile = await downloadMedia(videoUrl, `input-v-${Date.now()}.mp4`);
        audioFile = await downloadMedia(backgroundMusicUrl, `input-a-${Date.now()}.mp3`);
        narrationFile = await downloadMedia(narrationUrl, `input-n-${Date.now()}.mp3`);

        // CORREÇÃO CRÍTICA: Definindo serverUrl explicitamente para o renderMedia
        const bundleLocation = await bundle({
            entryPoint: path.resolve('./src/index.ts'),
            // Garantindo que o bundle seja gerado corretamente
        });

        const inputProps = { 
            videoUrl: videoFile, 
            title, 
            backgroundMusicUrl: audioFile,
            narrationUrl: narrationFile
        };

        const composition = await selectComposition({
            serverUrl: bundleLocation,
            id: compositionId,
            inputProps,
        });

        const outputName = `final-${Date.now()}.mp4`;
        const outputLocation = path.resolve(outputName);

        console.log('Iniciando renderização...');
        await renderMedia({
            composition,
            serveUrl: bundleLocation, // Parâmetro CORRETO exigido pelo Remotion v4
            codec: 'h264',
            outputLocation: outputLocation,
            inputProps,
        });

        // 1. Limpeza Imediata de Inputs
        try {
            if (videoFile) fs.unlinkSync(path.join(publicPath, videoFile));
            if (audioFile) fs.unlinkSync(path.join(publicPath, audioFile));
            if (narrationFile) fs.unlinkSync(path.join(publicPath, narrationFile));
            console.log('Inputs temporários removidos.');
        } catch (err) {
            console.error('Erro na limpeza de inputs:', err);
        }

        // 2. Limpeza Agendada de Output (10 minutos)
        setTimeout(() => {
            try {
                if (fs.existsSync(outputLocation)) {
                    fs.unlinkSync(outputLocation);
                    console.log(`Output ${outputName} removido após 10min.`);\n                }
            } catch (err) {\n                console.error('Erro na limpeza de output:', err);\n            }\n        }, 10 * 60 * 1000);\n\n        res.send({ \n            message: 'Renderizado!', \n            url: `https://automarketing-remotion.ykfift.easypanel.host/outputs/${outputName}` \n        });\n\n    } catch (error) {\n        console.error('ERRO DE RENDERIZAÇÃO:', error);\n        res.status(500).send({ error: error.message });\n    }\n});\n\napp.listen(3000, '0.0.0.0', () => console.log(`Servidor pronto na porta 3000`));