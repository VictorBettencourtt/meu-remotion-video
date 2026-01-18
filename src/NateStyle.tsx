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
      }}>\n        <div style={{\n          width: '90%',\n          height: '80%',\n          borderRadius: '30px',\n          border: '1px solid rgba(59,130,246,0.3)',\n          boxShadow: '0 80px 150px rgba(0,0,0,0.9)',\n          backgroundColor: '#000',\n          overflow: 'hidden',\n          position: 'relative',\n          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1)`\n        }}>\n          <div style={{\n            transform: `translateY(${translateY}px) scale(${zoom})`,\n            width: '100%',\n            height: '100%',\n            display: 'flex',\n            alignItems: 'flex-start'\n          }}>\n            {isVideo ? (\n              <OffthreadVideo src={mediaSrc} style={{ width: '100%', objectFit: 'cover' }} />\n            ) : (\n              <Img src={mediaSrc} style={{ width: '100%', objectFit: 'cover' }} />\n            )}\n          </div>\n        </div>\n      </AbsoluteFill>\n\n      {/* VINHETA CINEMÁTICA */}\n      <AbsoluteFill style={{ \n        background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.8) 100%)',\n        pointerEvents: 'none',\n        zIndex: 2 \n      }} />\n\n      {/* TÍTULO HUD FUTURISTA */}\n      <div style={{\n        position: 'absolute', \n        top: 60, \n        width: '100%', \n        display: 'flex',\n        justifyContent: 'center',\n        zIndex: 10,\n        opacity: glitchOpacity\n      }}>\n        <div style={{\n          background: 'rgba(0,0,0,0.6)',\n          backdropFilter: 'blur(10px)',\n          padding: '15px 50px',\n          border: '1px solid #3b82f6',\n          position: 'relative',\n          boxShadow: '0 0 30px rgba(59,130,246,0.2)',\n        }}>\n          \n          {/* CANTO VIVO ESQUERDO (BRACKET) */}\n          <div style={{\n            position: 'absolute',\n            top: -2,\n            left: -2,\n            width: '15px',\n            height: '15px',\n            borderTop: '3px solid #3b82f6',\n            borderLeft: '3px solid #3b82f6'\n          }} />\n\n          {/* CANTO VIVO DIREITO (BRACKET) */}\n          <div style={{\n            position: 'absolute',\n            top: -2,\n            right: -2,\n            width: '15px',\n            height: '15px',\n            borderTop: '3px solid #3b82f6',\n            borderRight: '3px solid #3b82f6'\n          }} />\n\n          <span style={{\n            color: '#fff',\n            fontSize: '28px',\n            fontWeight: '900',\n            textTransform: 'uppercase',\n            letterSpacing: '2px',\n            textShadow: '0 0 10px rgba(59,130,246,0.5)'\n          }}>\n            {title}\n          </span>\n        </div>\n      </div>\n\n      {/* AUDIO ENGINE */}\n      {backgroundMusicUrl && <Audio src={getMediaSource(backgroundMusicUrl)} volume={0.1} />}\n      {narrationUrl && <Audio src={getMediaSource(narrationUrl)} volume={1.0} />}\n    </AbsoluteFill>\n  );\n};