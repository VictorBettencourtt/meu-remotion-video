import { AbsoluteFill, Audio, staticFile, interpolate, useCurrentFrame, useVideoConfig, Img, OffthreadVideo, Easing, random } from 'remotion';
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
  
  // PERSPECTIVA 3D DINÂMICA
  const rotateX = interpolate(frame, [0, durationInFrames], [5, -5]);
  const rotateY = interpolate(frame, [0, durationInFrames], [-5, 5]);
  const zoom = interpolate(frame, [0, durationInFrames], [1.1, 1.3]);

  // MOVIMENTO COM INÉRCIA (SCROLL)
  const translateY = interpolate(
    frame,
    [0, durationInFrames],
    [0, -400],
    {
      easing: Easing.bezier(0.33, 1, 0.68, 1),
      extrapolateRight: 'clamp',
    }
  );

  // ANIMAÇÃO DE GLITCH (PRIMEIRO SEGUNDO)
  const glitchOpacity = frame < 30 ? (random(frame) > 0.8 ? 0.2 : 1) : 1;

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

      {/* CONTAINER DE PERSPECTIVA 3D */}
      <AbsoluteFill style={{ 
        justifyContent: 'center', 
        alignItems: 'center', 
        perspective: '1200px',
        zIndex: 1
      }}>
        <div style={{
          width: '90%',
          height: '80%',
          borderRadius: '30px',
          border: '1px solid rgba(59,130,246,0.3)',
          boxShadow: '0 80px 150px rgba(0,0,0,0.9)',
          backgroundColor: '#000',
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
        </div>
      </AbsoluteFill>

      {/* VINHETA CINEMÁTICA */}
      <AbsoluteFill style={{ 
        background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.8) 100%)',
        pointerEvents: 'none',
        zIndex: 2 
      }} />

      {/* TÍTULO HUD FUTURISTA */}
      <div style={{
        position: 'absolute', 
        top: 60, 
        width: '100%', 
        display: 'flex',
        justifyContent: 'center',
        zIndex: 10,
        opacity: glitchOpacity
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(10px)',
          padding: '15px 50px',
          border: '1px solid #3b82f6',
          position: 'relative',
          boxShadow: '0 0 30px rgba(59,130,246,0.2)',
        }}>
          
          {/* CANTO VIVO ESQUERDO (BRACKET) */}
          <div style={{
            position: 'absolute',
            top: -2,
            left: -2,
            width: '15px',
            height: '15px',
            borderTop: '3px solid #3b82f6',
            borderLeft: '3px solid #3b82f6'
          }} />

          {/* CANTO VIVO DIREITO (BRACKET) */}
          <div style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: '15px',
            height: '15px',
            borderTop: '3px solid #3b82f6',
            borderRight: '3px solid #3b82f6'
          }} />

          <span style={{
            color: '#fff',
            fontSize: '28px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: '0 0 10px rgba(59,130,246,0.5)'
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