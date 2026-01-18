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
          videoUrl: z.string(),
          title: z.string(),
          backgroundMusicUrl: z.string(),
          narrationUrl: z.string().optional(),
          isImage: z.boolean().optional(),
        })}
        defaultProps={{
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          title: "SISTEMA RECUPERADO!",
          backgroundMusicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          narrationUrl: "",
          isImage: false,
        }}
      />
      <Composition
        id="NateStyle"
        component={MyShort as any}
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
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          title: "ESTILO NATE",
          backgroundMusicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          narrationUrl: "",
          isImage: false,
        }}
      />
    </>
  );
};