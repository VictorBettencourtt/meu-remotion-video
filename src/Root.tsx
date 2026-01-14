import { MyShort } from './MeuShort';
import { Composition } from "remotion";
import { z } from "zod"; // Isso aqui tira o vermelho do 'z'

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
        schema={z.object({
          videoUrl: z.string(),
          title: z.string(),
          backgroundMusicUrl: z.string(),
          titleTop: z.number().min(0).max(1000).step(1),
          titleSize: z.number().min(20).max(200).step(1),
          titleColor: z.string(),
          borderRadius: z.number().min(0).max(200).step(1),
          blurAmount: z.number().min(0).max(100).step(1),
        })}
        defaultProps={{
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          title: "EDITANDO AO VIVO NO SERVIDOR!",
          backgroundMusicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
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