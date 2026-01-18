import { AbsoluteFill, Audio, staticFile, interpolate, useCurrentFrame, useVideoConfig, Img, OffthreadVideo } from 'remotion';
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
}> = ({ videoUrl, title, backgroundMusicUrl, narrationUrl, isImage = true }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  // MOVIMENTO NATE HERK: Zoom constante e deslocamento vertical
  const zoom = interpolate(frame, [0, durationInFrames], [1.1, 1.3]);
  const translateY = interpolate(frame, [0, durationInFrames], [0, -100]);

  const mediaSrc = getMediaSource(videoUrl);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', fontFamily: 'system-ui' }}>
      
      {/* VIBE DARK: Fundo borrado premium */}
      <AbsoluteFill style={{ 
        filter: 'blur(50px) brightness(0.15)', 
        transform: 'scale(1.2)',
        zIndex: 0
      }}>
        {isImage ? (
          <Img src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <OffthreadVideo src={mediaSrc} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </AbsoluteFill>

      {/* GRADIENTE DE PROFUNDIDADE */}
      <AbsoluteFill style={{ 
        background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(0,0,0,0.8) 100%)', 
        zIndex: 1 
      }} />

      {/* MOLDURA PREMIUM E CONTEÚDO */}
      <AbsoluteFill style={{ 
        justifyContent: 'center', 
        alignItems: 'center',
        zIndex: 2 
      }}>
        <div style={{
          width: '85%',
          height: '70%',
          borderRadius: '24px',
          border: '2px solid rgba(255,255,255,0.2)',
          boxShadow: '0 50px 100px rgba(0,0,0,0.9)',
          backgroundColor: '#000', // ELIMINAÇÃO DE GAPS
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            transform: `translateY(${translateY}px) scale(${zoom})`,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'flex-start'
          }}>
            {isImage ? (
              <Img src={mediaSrc} style={{ width: '100%', objectFit: 'contain' }} />
            ) : (
              <OffthreadVideo src={mediaSrc} style={{ width: '100%', objectFit: 'contain' }} />
            )}
          </div>

          {/* SCANNER LINE (HUD STYLE) */}
          <div style={{
             position: 'absolute',
             top: '50%',
             width: '100%',
             height: '2px',
             background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
             boxShadow: '0 0 20px rgba(59,130,246,0.8)',
             zIndex: 10
          }} />
        </div>
      </AbsoluteFill>

      {/* TIPOGRAFIA HUD: Badge Style */}
      <div style={{
        position: 'absolute', 
        top: 80, 
        width: '100%', 
        textAlign: 'center', 
        zIndex: 30
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          color: '#000000',
          fontSize: '32px',
          fontWeight: '900',
          padding: '12px 35px',
          display: 'inline-block',
          borderRadius: '12px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          fontFamily: 'system-ui'
        }}>
          {title}
        </div>
      </div>

      {backgroundMusicUrl && <Audio src={getMediaSource(backgroundMusicUrl)} volume={0.15} />}
      {narrationUrl && <Audio src={getMediaSource(narrationUrl)} volume={1.0} />}
    </AbsoluteFill>
  );
};