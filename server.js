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
    
    // LOGICA DE EXTENSÃO ULTRA-SEGURA (Evita ENAMETOOLONG)
    let extension = '.bin'; // Default seguro
    
    // Tenta pegar a extensão ignorando query params
    const urlPath = url.split('?')[0];
    const detectedExt = path.extname(urlPath).toLowerCase();
    
    const validExtensions = ['.mp4', '.mov', '.mp3', '.wav', '.jpg', '.jpeg', '.png', '.webp', '.avif'];
    
    if (validExtensions.includes(detectedExt)) {
        extension = detectedExt;
    } else {
        // Fallback baseado no prefixo do baseName
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
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            timeout: 60000,
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                const stats = fs.statSync(filePath);
                console.log(`[FACTORY] Finalizado: ${fileName} (${stats.size} bytes)`);
                
                if (stats.size < 100) {
                    fs.unlinkSync(filePath);
                    reject(new Error(`Arquivo inválido (muito pequeno): ${fileName}`));
                }
                resolve(fileName);
            });
            writer.on('error', (err) => {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                reject(err);
            });
        });
    } catch (error) {
        console.error(`[FACTORY] Erro no download: ${error.message}`);
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
        
        // Baixando com nomes curtos e seguros
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
            // Se for NateStyle ou a extensão for de imagem, isImage = true
            isImage: compositionId === 'NateStyle' || (videoFile && videoFile.match(/\.(jpg|jpeg|png|webp|avif)/i) !== null)
        };

        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: compositionId,
            inputProps,
        });

        const outputName = `render-${Date.now()}.mp4`;
        const outputLocation = path.resolve(outputName);

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

        // Cleanup
        [videoFile, audioFile, narrationFile].forEach(f => {
            if (f) {
                const p = path.join(publicPath, f);
                if (fs.existsSync(p)) fs.unlinkSync(p);
            }
        });

        setTimeout(() => {
            if (fs.existsSync(outputLocation)) fs.unlinkSync(outputLocation);
        }, 10 * 60 * 1000);

        res.send({ 
            success: true, 
            url: `https://automarketing-remotion.ykfift.easypanel.host/outputs/${outputName}` 
        });

    } catch (error) {
        console.error('[ERRO]', error.message);
        res.status(500).send({ 
            error: error.message,
            details: "Erro técnico na renderização. Filenames longos ou URLs expiradas."
        });
    }
});

app.get('/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Remotion Factory v2.1 na porta ${PORT}`));