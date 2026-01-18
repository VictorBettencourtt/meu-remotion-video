import { AbsoluteFill, OffthreadVideo, Audio, staticFile, interpolate, useCurrentFrame, useVideoConfig, Img, Easing } from 'remotion';
import React from 'react';

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

  // EFEITO NATE HERK - MOVIMENTO DINÂMICO
  const zoom = interpolate(frame, [0, durationInFrames], [1.1, 1.3], {
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });
  
  const translateY = interpolate(
    frame,
    [0, durationInFrames],
    [40, -60],
    {
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    }
  );

  const mediaSrc = getMediaSource(videoUrl);

  return (
    <AbsoluteFill style={{ backgroundColor: 'black', fontFamily: 'system-ui' }}>
      
      {/* FUNDO COM BLUR E BRIGHTNESS (REPLIT STYLE) */}
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

      {/* CONTAINER CENTRAL (ENQUADRAMENTO REPLIT 16:9 DENTRO DE 9:16) */}
      <AbsoluteFill style={{ 
        justifyContent: 'center', 
        alignItems: 'center', 
        zIndex: 1
      }}>
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
          <div style={{
            width: '100%',
            height: '100%',
            transform: `scale(${zoom})`,
          }}>
            <div style={{
              transform: `translateY(${translateY}px)`,
              width: '100%',
              height: '100%',
            }}>
              {isImage ? (
                <Img src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <OffthreadVideo src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {/* TÍTULO HUD BADGE (TOPO) */}
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
          <span style={{
            color: '#000',
            fontSize: '32px',
            fontWeight: '900',
            textTransform: 'uppercase',
          }}>
            {title}
          </span>
        </div>
      </div>

      {/* LEGENDA BARRA PRETA TRANSLÚCIDA (RODAPÉ) */}
      {captionText && (
        <div style={{
          position: 'absolute',
          bottom: 180,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 10
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.7)',
            padding: '20px 40px',
            width: '100%',
            textAlign: 'center',
            backdropFilter: 'blur(5px)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            <p style={{
              color: '#fff',
              fontSize: '38px',
              fontWeight: '700',
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