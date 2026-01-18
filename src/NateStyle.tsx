import { AbsoluteFill, Audio, staticFile, interpolate, useCurrentFrame, useVideoConfig, Img } from 'remotion';
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
  narrationUrl: string;
}> = ({ videoUrl, title, backgroundMusicUrl, narrationUrl }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  // Efeito Nate Herk: Scroll infinito para baixo
  // Começa no topo (0) e termina no final da imagem (-altura_restante)
  const translateY = interpolate(
    frame, 
    [0, durationInFrames], 
    [0, -100], 
    { extrapolateRight: 'clamp' }
  );

  const mediaSrc = getMediaSource(videoUrl);

  return (
    <AbsoluteFill style={{ backgroundColor: '#050505', fontFamily: 'system-ui' }}>
      
      {/* BACKGROUND COM OVERLAY */}
      <AbsoluteFill>
         <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,1) 80%)',
            zIndex: 1
         }} />
      </AbsoluteFill>

      {/* MÁQUINA DE SCROLL (ESTILO NATE) */}
      <AbsoluteFill style={{ 
        justifyContent: 'center', 
        alignItems: 'center',
        zIndex: 2 
      }}>
        <div style={{
          width: '85%',
          height: '70%',
          borderRadius: '24px',
          border: '2px solid rgba(255,255,255,0.1)',
          boxShadow: '0 50px 100px rgba(0,0,0,0.9)',
          backgroundColor: '#fff',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            transform: `translateY(${translateY}%)`,
            width: '100%'
          }}>
             <Img src={mediaSrc} style={{ width: '100%' }} />
          </div>

          {/* SCANNER LINE */}
          <div style={{
             position: 'absolute',
             top: '50%',
             width: '100%',
             height: '2px',
             background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
             boxShadow: '0 0 20px #3b82f6',
             zIndex: 10
          }} />
        </div>
      </AbsoluteFill>

      {/* OVERLAY DE TÍTULO TECH */}
      <div style={{
        position: 'absolute',
        bottom: 80,
        width: '100%',
        textAlign: 'center',
        padding: '0 60px',
        zIndex: 20
      }}>
        <div style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          fontSize: '42px',
          fontWeight: '900',
          padding: '10px 30px',
          display: 'inline-block',
          borderRadius: '12px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          boxShadow: '0 10px 30px rgba(59,130,246,0.5)'
        }}>
          {title}
        </div>
      </div>

      {backgroundMusicUrl && <Audio src={getMediaSource(backgroundMusicUrl)} volume={0.15} />}
      {narrationUrl && <Audio src={getMediaSource(narrationUrl)} volume={1.0} />}
    </AbsoluteFill>
  );
};