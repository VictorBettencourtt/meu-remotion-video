import { MyShort } from './MeuShort';
import { NateStyle } from './NateStyle';
import { DynamicNateStyle } from './DynamicNateStyle';
import { Composition } from "remotion";
import { z } from "zod";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MasterShort"
        component={MyShort as any}
        durationInFrames={450} // Valor default de fallback
        fps={30}
        width={1080}
        height={1920}
        schema={z.object({
          videoUrl: z.string(),
          title: z.string(),
          backgroundMusicUrl: z.string(),
          narrationUrl: z.string().optional(),
          captionText: z.string().optional(),
          isImage: z.boolean().optional(),
          durationInFrames: z.number().optional(),
        })}
        defaultProps={{
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          title: "SISTEMA RECUPERADO!",
          backgroundMusicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          narrationUrl: "",
          captionText: "Este é um resumo gerado por IA para o seu vídeo de Big Tech.",
          isImage: false,
          durationInFrames: 450,
        }}
      />
      <Composition
        id="NateStyle"
        component={NateStyle as any}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        schema={z.object({
          videoUrl: z.string(),
          title: z.string(),
          backgroundMusicUrl: z.string(),
          narrationUrl: z.string().optional(),
          isImage: z.boolean().optional(),
        })}
        defaultProps={{
          videoUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475",
          title: "ESTILO NATE",
          backgroundMusicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          narrationUrl: "",
          isImage: true,
        }}
      />
      <Composition
        id="HorizontalNate"
        component={MyShort as any}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        schema={z.object({
          videoUrl: z.string(),
          title: z.string(),
          backgroundMusicUrl: z.string(),
          narrationUrl: z.string().optional(),
          captionText: z.string().optional(),
          isImage: z.boolean().optional(),
        })}
        defaultProps={{
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          title: "YOUTUBE HORIZONTAL",
          backgroundMusicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          narrationUrl: "",
          captionText: "Este é um layout 16:9 automatizado com scanner lateral estilo Nate Herk.",
          isImage: false,
        }}
      />
      <Composition
        id="DynamicNateStyle"
        component={DynamicNateStyle as any}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920} // Default to vertical, but this will change based on user input during render
        schema={z.object({
          videoUrl: z.string(),
          title: z.string(),
          backgroundMusicUrl: z.string(),
          narrationUrl: z.string().optional(),
          captionText: z.string().optional(),
          captions: z.array(z.object({
            text: z.string(),
            start: z.number(),
            end: z.number(),
          })).optional(),
          isImage: z.boolean().optional(),
          durationInFrames: z.number().optional(),
        })}
        defaultProps={{
          videoUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475",
          title: "DYNAMIC NATE",
          backgroundMusicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          narrationUrl: "",
          captionText: "Legenda automática gerada por IA aparece aqui.",
          captions: [
            { text: "Legenda dinâmica exemplo 1", start: 0, end: 2000 },
            { text: "Legenda dinâmica exemplo 2", start: 2000, end: 4000 }
          ],
          isImage: true,
          durationInFrames: 450,
        }}
      />
    </>
  );
};