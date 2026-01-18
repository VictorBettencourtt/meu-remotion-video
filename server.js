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
    
    console.log(`[DOWNLOAD] Tentando: ${url}`);
    
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'video/*,audio/*,image/*,*/*'
            },
            timeout: 60000, // 60 segundos de timeout
            maxRedirects: 5
        });

        const contentType = response.headers['content-type'] || '';
        console.log(`[DOWNLOAD] Content-Type: ${contentType}`);

        if (contentType.includes('text/html')) {
            throw new Error(`A URL fornecida retornou uma página HTML em vez de um arquivo de mídia. Certifique-se de que é um link DIRETO para o vídeo/áudio.`);
        }

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                const stats = fs.statSync(filePath);
                console.log(`[DOWNLOAD] Sucesso: ${name} (${stats.size} bytes)`);
                if (stats.size < 1000) {
                    fs.unlinkSync(filePath);
                    reject(new Error(`O arquivo baixado é muito pequeno (${stats.size} bytes). Provavelmente o link expirou ou foi bloqueado.`));
                }
                resolve(name);
            });
            writer.on('error', (err) => {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                reject(err);
            });
        });
    } catch (error) {
        console.error(`[DOWNLOAD] Falha: ${url} -> ${error.message}`);
        throw error;
    }
}

app.post('/render', async (req, res) => {
    const { videoUrl, title, backgroundMusicUrl, narrationUrl, compositionId = 'MasterShort' } = req.body;
    
    let videoFile = '';
    let audioFile = '';
    let narrationFile = '';

    try {
        console.log('--- Início da Renderização ---');
        
        // Baixando um por um para isolar erros
        if (videoUrl) videoFile = await downloadMedia(videoUrl, `v-${Date.now()}.mp4`);
        if (backgroundMusicUrl) audioFile = await downloadMedia(backgroundMusicUrl, `a-${Date.now()}.mp3`);
        if (narrationUrl) narrationFile = await downloadMedia(narrationUrl, `n-${Date.now()}.mp3`);

        console.log('Arquivos locais prontos. Criando bundle...');

        const bundleLocation = await bundle({
            entryPoint: path.resolve('./src/index.ts'),
        });

        const inputProps = { 
            videoUrl: videoFile, 
            title: title || "Sem título", 
            backgroundMusicUrl: audioFile,
            narrationUrl: narrationFile,
            isImage: videoUrl && videoUrl.toLowerCase().match(/\.(jpg|jpeg|png|webp|avif)/) !== null
        };

        console.log(`Configurando Composição: ${compositionId}`);
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: compositionId,
            inputProps,
        });

        const outputName = `render-${Date.now()}.mp4`;
        const outputLocation = path.resolve(outputName);

        console.log('Executando Renderização FFmpeg...');
        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation: outputLocation,
            inputProps,
            onProgress: ({ progress }) => {
                console.log(`Progresso: ${(progress * 100).toFixed(0)}%`);
            }
        });

        // Limpeza
        [videoFile, audioFile, narrationFile].forEach(f => {
            if (f) {
                const p = path.join(publicPath, f);
                if (fs.existsSync(p)) fs.unlinkSync(p);
            }
        });

        setTimeout(() => {
            if (fs.existsSync(outputLocation)) fs.unlinkSync(outputLocation);
        }, 10 * 60 * 1000);

        console.log('Renderização Finalizada.');
        res.send({ 
            success: true, 
            url: `https://automarketing-remotion.ykfift.easypanel.host/outputs/${outputName}` 
        });

    } catch (error) {
        console.error('ERRO CRÍTICO NO SERVER:', error.message);
        res.status(500).send({ 
            error: error.message,
            tip: "Verifique se o link do vídeo é um link direto (termina em .mp4 ou similar) e não um link de página web."
        });
    }
});

app.get('/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Remotion Factory na porta ${PORT}`));