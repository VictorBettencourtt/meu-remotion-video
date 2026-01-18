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
  captionText?: string;
  isImage: boolean;
}> = ({ videoUrl, title, backgroundMusicUrl, narrationUrl, captionText, isImage }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  // PERSPECTIVA 3D DINÂMICA
  const rotateX = interpolate(frame, [0, durationInFrames], [5, -5]);
  const rotateY = interpolate(frame, [0, durationInFrames], [-5, 5]);
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.15]);

  // MOVIMENTO COM INÉRCIA (SCROLL) - Easing de alta qualidade para preencher a tela sem gaps
  const translateY = interpolate(
    frame,
    [0, durationInFrames],
    [0, -500], // Aumentado para cobrir conteúdos maiores em 60s
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

      {/* CONTAINER DE MÍDIA PRINCIPAL - TELA CHEIA SEM GAPS */}
      <AbsoluteFill style={{ 
        justifyContent: 'center', 
        alignItems: 'center', 
        perspective: '1000px',
        zIndex: 1
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${zoom})`,
          backgroundColor: '#000',
        }}>
          <div style={{
            transform: isImage ? `translateY(${translateY}px)` : 'none',
            width: '100%',
            height: isImage ? 'auto' : '100%',
          }}>
            {isImage ? (
              <Img src={mediaSrc} style={{ width: '100%', objectFit: 'cover' }} />
            ) : (
              <OffthreadVideo src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
        </div>
      </AbsoluteFill>

      {/* TITULO HUD SUPREMO - POSICIONADO NO TOPO */}
      <div style={{
        position: 'absolute',
        top: 60,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 10
      }}>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: '20px 50px',
          borderLeft: '12px solid #3b82f6',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        }}>
          <span style={{
            color: '#000',
            fontSize: '48px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            {title}
          </span>
        </div>
      </div>

      {/* LEGENDAS EM PORTUGUÊS - CENTRO/BAIXO */}
      {captionText && (
        <div style={{
          position: 'absolute',
          bottom: 150,
          width: '100%',
          textAlign: 'center',
          padding: '0 80px',
          zIndex: 10
        }}>
          <p style={{
            color: 'white',
            fontSize: '40px',
            fontWeight: '700',
            textShadow: '2px 2px 10px rgba(0,0,0,0.8)',
            lineHeight: '1.4'
          }}>
            {captionText}
          </p>
        </div>
      )}

      {backgroundMusicUrl && (
        <Audio src={getMediaSource(backgroundMusicUrl)} volume={0.1} />
      )}

      {narrationUrl && (
        <Audio src={getMediaSource(narrationUrl)} volume={1.0} />
      )}
    </AbsoluteFill>
  );
};