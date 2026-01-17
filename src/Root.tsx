import { MyShort } from './MeuShort';
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
          videoSrc: z.string(),
          title: z.string(),
          backgroundMusicUrl: z.string(),
          isImage: z.boolean(),
        })}
        defaultProps={{
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          title: "SHORTS PADRÃO",
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

      {/* 2. TEMPLATE HORIZONTAL (YOUTUBE 16:9) */}
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
          description: "A descrição do vídeo aparece aqui.",
          backgroundMusicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
          layoutType: 'split-screen',
          accentColor: "#3b82f6",
        }}
      />

      {/* 3. TEMPLATE DE NOTICIÁRIO (ESTILO SHOTSTACK) */}
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
          headline: "URGENTE: TITULO DA NOTICIA",
          subHeadline: "Subtítulo detalhando o acontecimento agora",
          logoUrl: "https://remotion.dev/img/logo-dark.png",
        }}
      />

      {/* 4. NOVO: TEMPLATE ESTILO NATE HERK (SCANNER FULLSCREEN) */}
      <Composition
        id="NateStyle"
        component={NateStyle as any}
        durationInFrames={300} // 10 segundos
        fps={30}
        width={1080}
        height={1920}
        schema={z.object({
          videoUrl: z.string(),
          title: z.string(),
          backgroundMusicUrl: z.string(),
          isImage: z.boolean(),
        })}
        defaultProps={{
          videoUrl: "https://github.com/user-attachments/assets/a49f412a-3336-43fa-a781-320550ffd5f1",
          title: "AUTOMAÇÃO DE ELITE N8N",
          backgroundMusicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          isImage: true,
        }}
      />
    </>
  );
};