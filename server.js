const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

app.post('/render', async (req, res) => {
    const { videoUrl, title } = req.body;
    const compositionId = 'MeuVideoPrincipal';

    const bundleLocation = await bundle(path.resolve('./src/index.ts'));
    const composition = await selectComposition({
        bundle: bundleLocation,
        id: compositionId,
        inputProps: { videoUrl, title },
    });

    const outputLocation = `out-${Date.now()}.mp4`;
    await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation,
        inputProps: { videoUrl, title },
    });

    res.send({ message: 'Renderizado!', file: outputLocation });
});

app.listen(3000, () => console.log('Servidor Remotion pronto na porta 3000'));