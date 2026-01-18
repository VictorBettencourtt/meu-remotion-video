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
    
    console.log(`Iniciando download: ${url} -> ${name}`);
    
    const response = await axios({ 
        url, 
        method: 'GET', 
        responseType: 'stream',
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => {
            const stats = fs.statSync(filePath);
            console.log(`Download concluído: ${name} (${stats.size} bytes)`);
            if (stats.size === 0) {
                reject(new Error(`Arquivo ${name} baixado com 0 bytes.`));
            }
            resolve(name);
        });
        writer.on('error', (err) => {
            console.error(`Erro no stream de escrita para ${name}:`, err);
            reject(err);
        });
        response.data.on('error', (err) => {
            console.error(`Erro no stream de resposta para ${name}:`, err);
            reject(err);
        });
    });
}

app.post('/render', async (req, res) => {
    const { videoUrl, title, backgroundMusicUrl, narrationUrl, compositionId = 'MasterShort' } = req.body;
    
    let videoFile = '';
    let audioFile = '';
    let narrationFile = '';

    try {
        console.log('--- Novo Pedido de Renderização ---');
        
        // Downloads em paralelo para maior velocidade, mas garantindo a integridade
        [videoFile, audioFile, narrationFile] = await Promise.all([
            downloadMedia(videoUrl, `input-v-${Date.now()}.mp4`),
            downloadMedia(backgroundMusicUrl, `input-a-${Date.now()}.mp3`),
            downloadMedia(narrationUrl, `input-n-${Date.now()}.mp3`)
        ]);

        console.log('Todos os assets preparados. Gerando bundle Remotion...');

        const bundleLocation = await bundle({
            entryPoint: path.resolve('./src/index.ts'),
        });

        const inputProps = { 
            videoUrl: videoFile, 
            title, 
            backgroundMusicUrl: audioFile,
            narrationUrl: narrationFile
        };

        console.log(`Selecionando composição: ${compositionId}`);
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: compositionId,
            inputProps,
        });

        const outputName = `final-${Date.now()}.mp4`;
        const outputLocation = path.resolve(outputName);

        console.log('Renderizando vídeo...');
        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation: outputLocation,
            inputProps,
        });

        // Limpeza de Inputs
        [videoFile, audioFile, narrationFile].forEach(file => {
            if (file) {
                const p = path.join(publicPath, file);
                if (fs.existsSync(p)) fs.unlinkSync(p);
            }
        });
        console.log('Assets temporários removidos.');

        // Limpeza de Output em 10 minutos
        setTimeout(() => {
            if (fs.existsSync(outputLocation)) fs.unlinkSync(outputLocation);
        }, 10 * 60 * 1000);

        console.log('Sucesso!');
        res.send({ 
            message: 'Renderizado!', 
            url: `https://automarketing-remotion.ykfift.easypanel.host/outputs/${outputName}` 
        });

    } catch (error) {
        console.error('ERRO NO PROCESSO:', error);
        res.status(500).send({ 
            error: error.message, 
            details: "Erro durante o processamento de mídia. Verifique se as URLs são válidas."
        });
    }
});

app.get('/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Servidor operacional na porta ${PORT}`));