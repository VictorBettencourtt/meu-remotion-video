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
  
  // MOVIMENTO NATE HERK (Scanner + Zoom)
  const zoom = interpolate(frame, [0, durationInFrames], [1.1, 1.3]);
  const translateY = interpolate(
    frame,
    [0, durationInFrames],
    [50, -100],
    {
      easing: Easing.bezier(0.33, 1, 0.68, 1),
      extrapolateRight: 'clamp',
    }
  );
  
  const mediaSrc = getMediaSource(videoUrl);

  return (
    <AbsoluteFill style={{ backgroundColor: 'black', fontFamily: 'system-ui' }}>
      
      {/* FUNDO COM BLUR - Otimizado para performance */}
      <AbsoluteFill style={{ 
        filter: 'blur(20px) brightness(0.2)', 
        transform: 'scale(1.2)',
        zIndex: 0
      }}>
        {isImage ? (
          <Img src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <OffthreadVideo src={mediaSrc} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </AbsoluteFill>

      {/* CONTAINER CENTRALIZADO VISUAL PREMIUM */}
      <AbsoluteFill style={{ 
        justifyContent: 'center', 
        alignItems: 'center', 
        zIndex: 1
      }}>
        <div style={{
          width: '90%',
          height: '80%',
          borderRadius: '40px',
          border: '4px solid #3b82f6',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          backgroundColor: '#000'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${zoom})`,
          }}>
            <div style={{
              transform: `translateY(${translateY}px)`,
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
        </div>
      </AbsoluteFill>

      {/* TÍTULO HUD SUPREMO - PILULA NO TOPO */}
      <div style={{
        position: 'absolute',
        top: 60,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 10
      }}>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          padding: '15px 40px',
          borderRadius: '100px',
          borderLeft: '12px solid #3b82f6',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        }}>
          <span style={{
            color: '#000',
            fontSize: '38px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {title}
          </span>
        </div>
      </div>

      {/* LEGENDA FUTURISTA */}
      {captionText && (
        <div style={{
          position: 'absolute',
          bottom: 120,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          padding: '0 40px',
          zIndex: 10
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            padding: '20px 40px',
            borderRadius: '15px',
            border: '1px solid #3b82f6',
            textAlign: 'center',
            maxWidth: '90%'
          }}>
            <p style={{
              color: '#fff',
              fontSize: '45px',
              fontWeight: '900',
              margin: 0,
              lineHeight: '1.2',
            }}>
              {captionText}
            </p>
          </div>
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