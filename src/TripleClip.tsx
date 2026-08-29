import { AbsoluteFill, OffthreadVideo, Audio, Series, staticFile, useVideoConfig } from 'remotion';
import React from 'react';

const getMediaSource = (src?: string) => {
  if (!src) return "";
  if (src.startsWith('http')) return src;
  return staticFile(src);
};

// Um clip individual dentro da sequência (Gancho, Conteúdo ou CTA).
// Mantém o mesmo enquadramento "cartão 16:9 dentro de 9:16" usado no MasterShort,
// mas sem o zoom/translateY animado (cada clip já é curto o suficiente).
const ClipSegment: React.FC<{
  videoUrl: string;
  label?: string;
  showLabel?: boolean;
}> = ({ videoUrl, label, showLabel }) => {
  const mediaSrc = getMediaSource(videoUrl);

  return (
    <AbsoluteFill style={{ backgroundColor: 'black', fontFamily: 'system-ui' }}>
      {/* FUNDO COM BLUR */}
      <AbsoluteFill style={{
        filter: 'blur(20px) brightness(0.2)',
        transform: 'scale(1.2)',
        zIndex: 0
      }}>
        <OffthreadVideo src={mediaSrc} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>

      {/* CONTAINER CENTRAL */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
        <div style={{
          width: '94%',
          aspectRatio: '16/9',
          borderRadius: '30px',
          border: '4px solid white',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          backgroundColor: '#000'
        }}>
          <OffthreadVideo src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </AbsoluteFill>

      {showLabel && label && (
        <div style={{
          position: 'absolute',
          top: 150,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 10
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '12px 30px',
            borderRadius: '10px',
            borderLeft: '10px solid #3b82f6',
            boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
          }}>
            <span style={{ color: '#000', fontSize: '32px', fontWeight: '900', textTransform: 'uppercase' }}>
              {label}
            </span>
          </div>
        </div>
      )}
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
