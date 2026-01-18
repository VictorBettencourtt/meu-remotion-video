import { AbsoluteFill, OffthreadVideo, Audio, staticFile, interpolate, useCurrentFrame, useVideoConfig, Img, Easing } from 'remotion';
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
  
  // PERSPECTIVA 3D DINÂMICA: Efeito de tablet flutuando
  const rotateX = interpolate(frame, [0, durationInFrames], [5, -5]);
  const rotateY = interpolate(frame, [0, durationInFrames], [-5, 5]);
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.15]);

  // MOVIMENTO COM INÉRCIA (SCROLL) - Easing de alta qualidade
  const translateY = interpolate(
    frame,
    [0, durationInFrames],
    [0, -300], // Valor de scroll ajustado para screenshots longos
    {
      easing: Easing.bezier(0.33, 1, 0.68, 1),
      extrapolateRight: 'clamp',
    }
  );
  
  const mediaSrc = getMediaSource(videoUrl);

  return (
    <AbsoluteFill style={{ backgroundColor: 'black', fontFamily: 'system-ui' }}>
      
      {/* PROFUNDIDADE VISUAL: FUNDO AMBIENTE DARK */}
      <AbsoluteFill style={{ 
        filter: 'blur(60px) brightness(0.15)', 
        transform: 'scale(1.4)',
        zIndex: 0
      }}>
        {isImage ? (
          <Img src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <OffthreadVideo src={mediaSrc} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </AbsoluteFill>

      {/* CONTAINER DE PERSPECTIVA 3D */}
      <AbsoluteFill style={{ 
        justifyContent: 'center', 
        alignItems: 'center', 
        perspective: '1000px',
        zIndex: 1
      }}>
        <div style={{
          width: '90%',
          borderRadius: '40px',
          overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.2)',
          boxShadow: '0 80px 150px rgba(0,0,0,0.9)',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${zoom})`,
          backgroundColor: '#000',
        }}>
          <div style={{
            transform: isImage ? `translateY(${translateY}px)` : 'none',
            width: '100%',
          }}>
            {isImage ? (
              <Img src={mediaSrc} style={{ width: '100%' }} />
            ) : (
              <OffthreadVideo src={mediaSrc} style={{ width: '100%' }} />
            )}
          </div>
        </div>
      </AbsoluteFill>

      {/* TITULO GLASSMORPHISM BADGE PREMIUM */}
      <div style={{
        position: 'absolute',
        top: 80,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 10
      }}>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          padding: '15px 40px',
          borderRadius: '20px',
          borderLeft: '8px solid #3b82f6',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        }}>
          <span style={{
            color: '#000',
            fontSize: '40px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {title}
          </span>
        </div>
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
