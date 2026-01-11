const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// ESSA LINHA É O SEGREDO: Cria uma pasta pública para baixar os vídeos
app.use('/outputs', express.static(path.resolve('./')));

app.post('/render', async (req, res) => {
    const { videoUrl, title } = req.body;
    const compositionId = 'MeuVideoPrincipal';

    try {
        console.log('Iniciando renderização...');
        const bundleLocation = await bundle(path.resolve('./src/index.ts'));

        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: compositionId,
            inputProps: { videoUrl, title },
        });

        const fileName = `video-${Date.now()}.mp4`;
        const outputLocation = path.resolve(fileName);

        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation: outputLocation,
            inputProps: { videoUrl, title },
        });

        console.log('Render concluído:', fileName);
        
        // Retorna a URL que o n8n vai usar para baixar o arquivo
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
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Remotion pronto na porta ${PORT}`);
});
