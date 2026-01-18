import { AbsoluteFill, Audio, staticFile, interpolate, useCurrentFrame, useVideoConfig, Img, OffthreadVideo, Easing } from 'remotion';
import React from 'react';

const getMediaSource = (src: string) => {
  if (!src) return "";
  if (src.startsWith('http')) return src;
  return staticFile(src);
};

export const NateStyle: React.FC<{
  videoUrl: string;
  title: string;
  backgroundMusicUrl: string;
  narrationUrl?: string;
  isImage?: boolean;
}> = ({ videoUrl, title, backgroundMusicUrl, narrationUrl }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  // PERSPECTIVA 3D DINÂMICA: Rotação suave estilo tablet flutuando
  const rotateX = interpolate(frame, [0, durationInFrames], [5, -5]);
  const rotateY = interpolate(frame, [0, durationInFrames], [-5, 5]);
  const zoom = interpolate(frame, [0, durationInFrames], [1.1, 1.3]);

  // MOVIMENTO COM INÉRCIA (SCROLL): Easing de alta qualidade para o scroll
  const translateY = interpolate(
    frame,
    [0, durationInFrames],
    [0, -400],
    {
      easing: Easing.bezier(0.33, 1, 0.68, 1),
      extrapolateRight: 'clamp',
    }
  );

  const mediaSrc = getMediaSource(videoUrl);
  const isVideo = videoUrl.toLowerCase().includes('.mp4') || videoUrl.toLowerCase().includes('.mov');

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', fontFamily: 'system-ui' }}>
      
      {/* BACKGROUND DARK PREMIUM COM BLUR */}
      <AbsoluteFill style={{ 
        filter: 'blur(60px) brightness(0.15)', 
        transform: 'scale(1.4)',
        zIndex: 0
      }}>
        {isVideo ? (
          <OffthreadVideo src={mediaSrc} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Img src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </AbsoluteFill>

      {/* CONTAINER DE PERSPECTIVA 3D (O SEGREDO DO NATE HERK) */}
      <AbsoluteFill style={{ 
        justifyContent: 'center', 
        alignItems: 'center', 
        perspective: '1200px', // Profundidade Z
        zIndex: 1
      }}>
        <div style={{
          width: '90%',
          height: '80%',
          borderRadius: '30px',
          border: '2px solid rgba(255,255,255,0.2)',
          boxShadow: '0 80px 150px rgba(0,0,0,0.9)',
          backgroundColor: '#000', // Sem gaps brancos
          overflow: 'hidden',
          position: 'relative',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1)`
        }}>
          <div style={{
            transform: `translateY(${translateY}px) scale(${zoom})`,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'flex-start'
          }}>
            {isVideo ? (
              <OffthreadVideo src={mediaSrc} style={{ width: '100%', objectFit: 'cover' }} />
            ) : (
              <Img src={mediaSrc} style={{ width: '100%', objectFit: 'cover' }} />
            )}
          </div>

          {/* SCANNER LINE (DETALHE TECH) */}
          <div style={{
             position: 'absolute',
             top: '50%',
             width: '100%',
             height: '2px',
             background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
             boxShadow: '0 0 25px rgba(59,130,246,0.8)',
             zIndex: 10
          }} />
        </div>
      </AbsoluteFill>

      {/* VINHETA CINEMÁTICA */}
      <AbsoluteFill style={{ 
        background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.8) 100%)',
        pointerEvents: 'none',
        zIndex: 2 
      }} />

      {/* TÍTULO GLASSMORPHISM PREMIUM BADGE */}
      <div style={{
        position: 'absolute', 
        top: 60, 
        width: '100%', 
        display: 'flex',
        justifyContent: 'center',
        zIndex: 10
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '12px 45px',
          borderRadius: '20px',
          borderLeft: '10px solid #3b82f6',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
        }}>
          <span style={{
            color: '#000',
            fontSize: '32px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {title}
          </span>
        </div>
      </div>

      {/* AUDIO ENGINE */}
      {backgroundMusicUrl && <Audio src={getMediaSource(backgroundMusicUrl)} volume={0.1} />}
      {narrationUrl && <Audio src={getMediaSource(narrationUrl)} volume={1.0} />}
    </AbsoluteFill>
  );
};