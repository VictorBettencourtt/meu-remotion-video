import { MyShort } from './MeuShort';
import { Composition } from "remotion";
import { z } from "zod";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MasterTemplate"
        component={MyShort as any}
        durationInFrames={450} // 15 segundos padrão
        fps={30}
        width={1080}
        height={1920}
        schema={z.object({
          // CONTEÚDO
          videoUrl: z.string(),
          title: z.string(),
          backgroundMusicUrl: z.string(),
          
          // LAYOUT (Dropdown no navegador)
          layoutType: z.enum(['centralizado', 'noticiario', 'cinema']), 
          
          // AJUSTES TÉCNICOS
          titleTop: z.number().min(0).max(1000).step(1),
          titleSize: z.number().min(20).max(200).step(1),
          titleColor: z.string(),
          
          // ESTILO DO VÍDEO
          borderRadius: z.number().min(0).max(200).step(1),
          blurAmount: z.number().min(0).max(100).step(1),
          videoScale: z.number().min(0.5).max(1.5).step(0.01),
          
          // EXIBIÇÃO (Checkboxes)
          mostrarLogo: z.boolean(),
          mostrarLegendaFundo: z.boolean(),
        })}
        defaultProps={{
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          title: "ESTILO PELA INTELIGÊNCIA",
          backgroundMusicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          layoutType: 'centralizado',
          titleTop: 200,
          titleSize: 70,
          titleColor: "#ffffff",
          borderRadius: 40,
          blurAmount: 20,
          videoScale: 0.9,
          mostrarLogo: true,
          mostrarLegendaFundo: true,
        }}
      />
    </>
  );
};