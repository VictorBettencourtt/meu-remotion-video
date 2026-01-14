import { MyShort } from './MeuShort';
import { MeuVideoLongo } from './MeuVideoLongo';
import { NewsTemplate } from './NewsTemplate'; // NOVO IMPORT
import { Composition } from "remotion";
import { z } from "zod";

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
          titleTop: z.number(),
          titleSize: z.number(),
          titleColor: z.string(),
          borderRadius: z.number(),
          blurAmount: z.number(),
          videoScale: z.number(),
          mostrarLogo: z.boolean(),
        })}
        defaultProps={{
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          title: "SHORTS PADRÃO",
          backgroundMusicUrl: "",
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

      <Composition
        id="VideoHorizontal"
        component={MeuVideoLongo as any}
        durationInFrames={900}
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
        })}
        defaultProps={{
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          title: "VÍDEO HORIZONTAL",
          description: "Descrição de teste.",
          backgroundMusicUrl: "",
          layoutType: 'split-screen',
          accentColor: "#3b82f6",
        }}
      />

      {/* NOVO: TEMPLATE DE NOTICIÁRIO PROFISSIONAL (TIPO SHOTSTACK) */}
      <Composition
        id="NewsReport"
        component={NewsTemplate as any}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        schema={z.object({
          videoUrl: z.string(),
          audioUrl: z.string(),
          headline: z.string(),
          subHeadline: z.string(),
          logoUrl: z.string(),
        })}
        defaultProps={{
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          headline: "URGENTE: NOVO JULGAMENTO NO STF",
          subHeadline: "Defesa alega que decisão de Moraes foi prematura",
          logoUrl: "logo.png",
        }}
      />
    </>
  );
};