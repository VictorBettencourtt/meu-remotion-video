const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const express = require('express');
app.use('/outputs', express.static(path.resolve('./')));
const path = require('path');

const app = express();
app.use(express.json());

app.post('/render', async (req, res) => {
    const { videoUrl, title } = req.body;
    const compositionId = 'MeuVideoPrincipal';

    try {
        console.log('Iniciando renderização...');
        // Gera o pacote do vídeo
        const bundleLocation = await bundle(path.resolve('./src/index.ts'));

        // Seleciona a composição (Ajustado para serveUrl)
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: compositionId,
            inputProps: { videoUrl, title },
        });

        const outputLocation = `out-${Date.now()}.mp4`;

        // Renderiza o MP4
        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation: path.resolve(outputLocation),
            inputProps: { videoUrl, title },
        });

        console.log('Render concluído:', outputLocation);
        res.send({ 
            message: 'Renderizado!', 
            file: outputLocation,
            url: `https://automarketing-remotion.ykfift.easypanel.host/outputs/${outputLocation}` 
        });

    } catch (error) {
        console.error('Erro no render:', error);
        res.status(500).send({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Servidor Remotion pronto na porta ${PORT}`));
