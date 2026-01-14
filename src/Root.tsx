import { MyShort } from './MeuShort';
import { MeuVideoLongo } from './MeuVideoLongo'; // Novo import
import { Composition } from "remotion";
import { z } from "zod";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* TEMPLATE VERTICAL (SHORTS/REELS) */}
      <Composition
        id="MasterShort"
        component={MyShort as any}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        schema={z.object({
          videoUrl: z.string(),
          title: z.string(),
          backgroundMusicUrl: z.string(),
          layoutType: z.enum(['centralizado', 'noticiario', 'cinema']), 
          titleTop: z.number().min(0).max(1000).step(1),
          titleSize: z.number().min(20).max(200).step(1),
          titleColor: z.string(),
          borderRadius: z.number().min(0).max(200).step(1),
          blurAmount: z.number().min(0).max(100).step(1),
          videoScale: z.number().min(0.5).max(1.5).step(0.01),
          mostrarLogo: z.boolean(),
        })}
        defaultProps={{
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          title: "ESTILO VERTICAL",
          backgroundMusicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          layoutType: 'centralizado',
          titleTop: 200,
          titleSize: 70,
          titleColor: "#ffffff",
          borderRadius: 40,
          blurAmount: 20,
          videoScale: 0.9,
          mostrarLogo: true,
        }}
      />

      {/* NOVO: TEMPLATE HORIZONTAL (YOUTUBE PADRÃO) */}
      <Composition
        id="VideoHorizontal"
        component={MeuVideoLongo as any}
        durationInFrames={900} // 30 segundos
        fps={30}
        width={1920}
        height={1080}
        schema={z.object({
          videoUrl: z.string(),
          title: z.string(),
          description: z.string(),
          backgroundMusicUrl: z.string(),
          layoutType: z.enum(['split-screen', 'fullscreen', 'pip']), 
          accentColor: z.string(),
          mostrarFacecam: z.boolean(),
        })}
        defaultProps={{
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          title: "AUTOMAÇÃO DE VÍDEO COM N8N",
          description: "Aprenda como escalar seu canal usando inteligência artificial e Remotion rodando na DigitalOcean.",
          backgroundMusicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
          layoutType: 'split-screen',
          accentColor: "#3b82f6",
          mostrarFacecam: false,
        }}
      />
    </>
  );
};