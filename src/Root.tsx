import { PrimeReport } from './PrimeReport';
import { MyShort } from './MeuShort';
import { NateStyle } from './NateStyle';
import { DynamicNateStyle } from './DynamicNateStyle';
import { TripleClip } from './TripleClip';
import { Composition, staticFile } from "remotion";
import { z } from "zod";
import { getVideoMetadata } from "@remotion/media-utils";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="PrimeReport" component={PrimeReport as any} durationInFrames={900} fps={30} width={1920} height={1080} calculateMetadata={({props}: any) => ({durationInFrames: props.durationInFrames})} defaultProps={{images: ['placeholder.jpg'], voice: '', music: '', logo: '', headlines: [], durationInFrames: 900}} />
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
          caption: z.any().optional(),
          captions: z.any().optional(),
          isImage: z.boolean().optional(),
          durationInFrames: z.number().optional(),
        })}
        calculateMetadata={async ({ props }) => {
          let duration = props.durationInFrames || 450;
          let videoAspectRatio = 16 / 9; // Default fallback

          if (!props.isImage && props.videoUrl) {
            try {
              let urlToFetch = props.videoUrl;
              if (!urlToFetch.startsWith('http')) {
                  urlToFetch = staticFile(urlToFetch);
              }
              const meta = await getVideoMetadata(urlToFetch);
              // Set duration to video length if no explicit duration was provided,
              // or ensure it plays the full video length.
              const vidDuration = Math.round(meta.durationInSeconds * 30);
              if (!props.durationInFrames) {
                  duration = vidDuration;
              } else {
                  // Ensure we use at least the requested length, unless it's way off
                  duration = Math.max(duration, vidDuration);
              }
              videoAspectRatio = meta.width / meta.height;
            } catch (e) {
              console.error("Failed to getting video metadata:", e);
            }
          }

          return {
            durationInFrames: duration,
            props: {
              ...props,
              videoAspectRatio
            }
          };
        }}
        defaultProps={{
          videoUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475",
          title: "DYNAMIC NATE",
          backgroundMusicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          narrationUrl: "",
          captionText: "Legenda automática gerada por IA aparece aqui.",
          isImage: true,
          durationInFrames: 450,
        }}
      />
      {/*
        TRIPLECLIP: concatena Gancho + Conteúdo + CTA em UM vídeo final.
        Resolve a limitação em que as composições acima só suportavam 1 clipe por render
        (o que forçava o fluxo "Edição de Vídeos" a chamar o Remotion 3x sem nunca juntar
        os vídeos em sequência). Usa <Series> em src/TripleClip.tsx.
        calculateMetadata soma automaticamente a duração real (em segundos) de cada
        um dos 3 vídeos recebidos, então o n8n não precisa calcular frames manualmente
        — basta mandar as 3 URLs; se ganchoTempo/conteudoTempo/ctaTempo (segundos) vierem,
        eles são usados como fallback quando a duração real não puder ser lida.
      */}
      <Composition
        id="TripleClip"
        component={TripleClip as any}
        durationInFrames={450} // fallback; recalculado em calculateMetadata
        fps={30}
        width={1080}
        height={1920}
        schema={z.object({
          ganchoUrl: z.string(),
          ganchoTempo: z.number().optional(),
          conteudoUrl: z.string(),
          conteudoTempo: z.number().optional(),
          ctaUrl: z.string(),
          ctaTempo: z.number().optional(),
          title: z.string().optional(),
          backgroundMusicUrl: z.string().optional(),
          narrationUrl: z.string().optional(),
        })}
        calculateMetadata={async ({ props }) => {
          const fps = 30;

          const resolveDurationFrames = async (url: string, fallbackSeconds?: number) => {
            const fallbackFrames = Math.round((fallbackSeconds || 3) * fps);
            if (!url) return fallbackFrames;
            try {
              const urlToFetch = url.startsWith('http') ? url : staticFile(url);
              const meta = await getVideoMetadata(urlToFetch);
              return Math.max(1, Math.round(meta.durationInSeconds * fps));
            } catch (e) {
              console.error('[TripleClip] Falha ao ler metadata de', url, e);
              return fallbackFrames;
            }
          };

          const [ganchoFrames, conteudoFrames, ctaFrames] = await Promise.all([
            resolveDurationFrames(props.ganchoUrl, props.ganchoTempo),
            resolveDurationFrames(props.conteudoUrl, props.conteudoTempo),
            resolveDurationFrames(props.ctaUrl, props.ctaTempo),
          ]);

          return {
            durationInFrames: ganchoFrames + conteudoFrames + ctaFrames,
            props: {
              ...props,
              ganchoDurationInFrames: ganchoFrames,
              conteudoDurationInFrames: conteudoFrames,
              ctaDurationInFrames: ctaFrames,
            },
          };
        }}
        defaultProps={{
          ganchoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          ganchoTempo: 3,
          conteudoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          conteudoTempo: 5,
          ctaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          ctaTempo: 3,
          title: "",
          backgroundMusicUrl: "",
          narrationUrl: "",
        }}
      />
    </>
  );
};