import { MyShort } from './MeuShort';
import { Composition } from "remotion";
import { z } from "zod"; // O Remotion já vem com isso

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MeuVideoPrincipal"
        component={MyShort as any}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        // ISSO AQUI CRIA OS SLIDERS NO SEU NAVEGADOR:
        schema={z.object({
          videoUrl: z.string(),
          title: z.string(),
          backgroundMusicUrl: z.string(),
          titleTop: z.number().min(0).max(1000).step(1), // Slider de altura
          titleSize: z.number().min(20).max(200).step(1), // Slider de tamanho da fonte
          titleColor: z.string(), // Input de cor
          borderRadius: z.number().min(0).max(200).step(1), // Arredondamento do vídeo
          blurAmount: z.number().min(0).max(100).step(1), // Intensidade do desfoque
        })}
        defaultProps={{
          videoUrl: "video-exemplo.mp4",
          title: "EDITANDO AO VIVO NO SERVIDOR!",
          backgroundMusicUrl: "audio-exemplo.mp4",
          titleTop: 150,
          titleSize: 60,
          titleColor: "#ffffff",
          borderRadius: 30,
          blurAmount: 20,
        }}
      />
    </>
  );
};