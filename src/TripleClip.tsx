import { AbsoluteFill, OffthreadVideo, Audio, Series, staticFile, useVideoConfig } from 'remotion';
import React from 'react';

const getMediaSource = (src?: string) => {
  if (!src) return "";
  if (src.startsWith('http')) return src;
  return staticFile(src);
};

// Um clip individual dentro da sequência (Gancho, Conteúdo ou CTA).
// Vídeo puro, ocupando 100% do frame — sem cartão, sem borda, sem blur de fundo,
// sem badge de título sobreposto. `label`/`showLabel` ficam nas props só por
// compatibilidade com quem já manda `title`, mas não são mais renderizados.
const ClipSegment: React.FC<{
  videoUrl: string;
  label?: string;
  showLabel?: boolean;
}> = ({ videoUrl }) => {
  const mediaSrc = getMediaSource(videoUrl);

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <OffthreadVideo src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </AbsoluteFill>
  );
};

// Concatena 3 clipes (Gancho -> Conteúdo -> CTA) em um único vídeo final,
// usando <Series> do Remotion para tocá-los em sequência (não sobrepostos).
export const TripleClip: React.FC<{
  ganchoUrl: string;
  ganchoDurationInFrames: number;
  conteudoUrl: string;
  conteudoDurationInFrames: number;
  ctaUrl: string;
  ctaDurationInFrames: number;
  title?: string;
  backgroundMusicUrl?: string;
  narrationUrl?: string;
}> = ({
  ganchoUrl,
  ganchoDurationInFrames,
  conteudoUrl,
  conteudoDurationInFrames,
  ctaUrl,
  ctaDurationInFrames,
  title,
  backgroundMusicUrl,
  narrationUrl,
}) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Series>
        <Series.Sequence durationInFrames={Math.max(1, Math.round(ganchoDurationInFrames))}>
          <ClipSegment videoUrl={ganchoUrl} label={title} showLabel={!!title} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={Math.max(1, Math.round(conteudoDurationInFrames))}>
          <ClipSegment videoUrl={conteudoUrl} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={Math.max(1, Math.round(ctaDurationInFrames))}>
          <ClipSegment videoUrl={ctaUrl} />
        </Series.Sequence>
      </Series>

      {backgroundMusicUrl && (
        <Audio src={getMediaSource(backgroundMusicUrl)} volume={0.1} />
      )}
      {narrationUrl && (
        <Audio src={getMediaSource(narrationUrl)} volume={1.0} />
      )}
    </AbsoluteFill>
  );
};
