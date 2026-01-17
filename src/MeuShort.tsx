import { AbsoluteFill, OffthreadVideo, Audio, staticFile, interpolate, useCurrentFrame, useVideoConfig, Img } from 'remotion';
import React from 'react';

// Função que decide se usa o link direto ou o staticFile
const getMediaSource = (src: string) => {
  if (!src) return "";
  if (src.startsWith('http')) return src;
  return staticFile(src);
};

export const MyShort: React.FC<{
  videoUrl: string;
  title: string;
  backgroundMusicUrl: string;
  narrationUrl: string;
  isImage: boolean;
}> = ({ videoUrl, title, backgroundMusicUrl, narrationUrl, isImage }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.15]);
  
  const mediaSrc = getMediaSource(videoUrl);

  return (
    <AbsoluteFill style={{ backgroundColor: 'black', fontFamily: 'sans-serif' }}>
      
      {/* FUNDO AMBIENTE */}
      <AbsoluteFill style={{ filter: 'blur(30px) brightness(0.3)', transform: 'scale(1.4)' }}>
        {isImage ? (
          <Img src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <OffthreadVideo src={mediaSrc} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </AbsoluteFill>

      {/* CONTEÚDO PRINCIPAL */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          width: '92%',
          borderRadius: '40px',
          overflow: 'hidden',
          border: '6px solid #3b82f6', // Borda azul n8n fixa
          boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
          transform: isImage ? `scale(${zoom})` : 'none'
        }}>
          {isImage ? (
            <Img src={mediaSrc} style={{ width: '100%' }} />
          ) : (
            <OffthreadVideo src={mediaSrc} style={{ width: '100%' }} />
          )}
        </div>
      </AbsoluteFill>

      {/* TÍTULO */}
      <div style={{
        position: 'absolute',
        top: 120,
        width: '100%',
        textAlign: 'center',
        color: '#faff00', // Amarelo Neon
        fontSize: '70px',
        fontWeight: '900',
        padding: '0 50px',
        textShadow: '0 10px 30px black',
        textTransform: 'uppercase',
        lineHeight: '1'
      }}>
        {title}
      </div>

      {backgroundMusicUrl && (
        <Audio src={getMediaSource(backgroundMusicUrl)} volume={0.1} />
      )}

      {narrationUrl && (
        <Audio src={getMediaSource(narrationUrl)} volume={1.0} />
      )}
    </AbsoluteFill>
  );
};
