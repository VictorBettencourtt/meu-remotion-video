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

async function downloadMedia(url, baseName) {
    if (!url || url === "" || url === "N/A") return "";
    
    const urlPath = url.split('?')[0];
    let detectedExt = path.extname(urlPath).toLowerCase();
    
    const validExtensions = ['.mp4', '.mov', '.mp3', '.wav', '.jpg', '.jpeg', '.png', '.webp', '.avif'];
    let extension = '.bin';

    if (validExtensions.includes(detectedExt)) {
        extension = detectedExt;
    } else {
        if (baseName.startsWith('v-')) extension = '.mp4';
        if (baseName.startsWith('a-')) extension = '.mp3';
        if (baseName.startsWith('n-')) extension = '.mp3';
    }
    
    const fileName = `${baseName}${extension}`;
    const filePath = path.join(publicPath, fileName);
    
    console.log(`[FACTORY] Baixando: ${url} -> ${fileName}`);
    
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
        
        const stats = fs.statSync(filePath);
        console.log(`[FACTORY] Finalizado: ${fileName} (${stats.size} bytes)`);
        
        if (stats.size < 1000) {
            try { fs.unlinkSync(filePath); } catch(e) {}
            throw new Error(`Arquivo corrompido ou incompleto: ${fileName}`);
        }
        return fileName;
    } catch (error) {
        console.error(`[FACTORY] Erro no download: ${error.message}`);
        if (fs.existsSync(filePath)) try { fs.unlinkSync(filePath); } catch(e) {}
        throw error;
    }
}

app.post('/render', async (req, res) => {
    const { videoUrl, title, backgroundMusicUrl, narrationUrl, compositionId = 'MasterShort' } = req.body;
    
    let videoFile = '';
    let audioFile = '';
    let narrationFile = '';

    try {
        console.log(`--- Iniciando Renderização: ${compositionId} ---`);
        
        // Download sequencial garantido com escrita síncrona
        if (videoUrl) videoFile = await downloadMedia(videoUrl, `v-${Date.now()}`);
        if (backgroundMusicUrl) audioFile = await downloadMedia(backgroundMusicUrl, `a-${Date.now()}`);
        if (narrationUrl) narrationFile = await downloadMedia(narrationUrl, `n-${Date.now()}`);

        const bundleLocation = await bundle({
            entryPoint: path.resolve('./src/index.ts'),
        });

        const inputProps = { 
            videoUrl: videoFile, 
            title: title || "Sem título", 
            backgroundMusicUrl: audioFile,
            narrationUrl: narrationFile,
            isImage: compositionId === 'NateStyle' || (videoFile && videoFile.match(/\.(jpg|jpeg|png|webp|avif)/i) !== null)
        };

        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: compositionId,
            inputProps,
        });

        const outputName = `render-${Date.now()}.mp4`;
        const outputLocation = path.resolve(outputName);

        // LOGICA DE SEGURANÇA: FFmpeg Check
        console.log('[FACTORY] Iniciando motor de renderização...');

        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation: outputLocation,
            inputProps,
            onProgress: ({ progress }) => {
                console.log(`Render: ${(progress * 100).toFixed(0)}%`);
            }
        });

        // Cleanup com atraso de segurança
        setTimeout(() => {
            [videoFile, audioFile, narrationFile].forEach(f => {
                if (f) {
                    const p = path.join(publicPath, f);
                    try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch(e) {}
                }
            });
        }, 5000);

        setTimeout(() => {
            try { if (fs.existsSync(outputLocation)) fs.unlinkSync(outputLocation); } catch(e) {}
        }, 10 * 60 * 1000);

        res.send({ 
            success: true, 
            url: `https://automarketing-remotion.ykfift.easypanel.host/outputs/${outputName}` 
        });

    } catch (error) {
        console.error('[ERRO CRÍTICO]', error.message);
        res.status(500).send({ 
            error: error.message,
            details: "O motor de mídia falhou ao processar o arquivo. Verifique se o link de vídeo é direto."
        });
    }
});

app.get('/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Remotion Factory v2.4 na porta 3000`));