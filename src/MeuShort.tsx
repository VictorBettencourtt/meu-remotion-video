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
  const { durationInFrames, width, height } = useVideoConfig();
  const isHorizontal = width > height;

  // PERSPECTIVA 3D DINÂMICA
  const rotateX = interpolate(frame, [0, durationInFrames], [isHorizontal ? 2 : 5, isHorizontal ? -2 : -5]);
  const rotateY = interpolate(frame, [0, durationInFrames], [isHorizontal ? -3 : -5, isHorizontal ? 3 : 5]);

  // MOVIMENTO NATE HERK (Scanner + Zoom)
  // Ajuste de zoom e translação para horizontal
  const zoom = interpolate(frame, [0, durationInFrames], [isHorizontal ? 1.0 : 1.1, isHorizontal ? 1.2 : 1.3]);
  
  const translateY = interpolate(
    frame,
    [0, durationInFrames],
    [isHorizontal ? 0 : 50, isHorizontal ? 0 : -100],
    {
      easing: Easing.bezier(0.33, 1, 0.68, 1),
      extrapolateRight: 'clamp',
    }
  );

  const translateX = interpolate(
    frame,
    [0, durationInFrames],
    [isHorizontal ? 50 : 0, isHorizontal ? -50 : 0],
    {
      easing: Easing.bezier(0.33, 1, 0.68, 1),
      extrapolateRight: 'clamp',
    }
  );

  const mediaSrc = getMediaSource(videoUrl);

  return (
    <AbsoluteFill style={{ backgroundColor: 'black', fontFamily: 'system-ui' }}>
      
      {/* FUNDO COM BLUR */}
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

      {/* CONTAINER CENTRALIZADO */}
      <AbsoluteFill style={{ 
        justifyContent: 'center', 
        alignItems: 'center', 
        zIndex: 1
      }}>
        <div style={{
          width: isHorizontal ? '70%' : '90%',
          height: isHorizontal ? '75%' : '80%',
          borderRadius: isHorizontal ? '20px' : '40px',
          border: '4px solid #3b82f6',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          backgroundColor: '#000'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${zoom})`,
          }}>
            <div style={{
              transform: `translate(${translateX}px, ${translateY}px)`,
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

      {/* TÍTULO - Lógica condicional para Horizontal */}
      <div style={{
        position: 'absolute', 
        top: isHorizontal ? 40 : 60,
        left: isHorizontal ? 40 : 'auto',
        width: isHorizontal ? 'auto' : '100%',
        display: 'flex',
        justifyContent: isHorizontal ? 'flex-start' : 'center',
        zIndex: 10
      }}>
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: isHorizontal ? '10px 25px' : '15px 40px',
          borderRadius: isHorizontal ? '10px' : '100px',
          borderLeft: '12px solid #3b82f6',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
        }}>
          <span style={{
            color: '#fff',
            fontSize: isHorizontal ? '28px' : '38px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {title}
          </span>
        </div>
      </div>

      {/* LEGENDA - Lógica condicional para Horizontal */}
      {captionText && (
        <div style={{
          position: 'absolute',
          bottom: isHorizontal ? 40 : 120,
          right: isHorizontal ? 40 : 'auto',
          left: isHorizontal ? 'auto' : 0,
          width: isHorizontal ? 'auto' : '100%',
          display: 'flex',
          justifyContent: isHorizontal ? 'flex-end' : 'center',
          padding: isHorizontal ? 0 : '0 40px',
          zIndex: 10
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            padding: isHorizontal ? '15px 30px' : '20px 40px',
            borderRadius: isHorizontal ? '10px' : '15px',
            border: '1px solid #3b82f6',
            textAlign: isHorizontal ? 'right' : 'center',
            maxWidth: isHorizontal ? '400px' : '90%'
          }}>
            <p style={{
              color: '#fff',
              fontSize: isHorizontal ? '24px' : '45px',
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