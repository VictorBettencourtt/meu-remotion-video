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
  
  // MOVIMENTO NATE HERK: Zoom constante e deslocamento vertical agressivo
  const zoom = interpolate(frame, [0, durationInFrames], [1.1, 1.3]);
  const translateY = interpolate(frame, [0, durationInFrames], [0, -150]);

  const mediaSrc = getMediaSource(videoUrl);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', fontFamily: 'system-ui' }}>
      
      {/* FULLSCREEN MEDIA COM SCROLL E ZOOM - SEM GAPS */}
      <AbsoluteFill style={{ 
        transform: `translateY(${translateY}px) scale(${zoom})`,
        zIndex: 1
      }}>
        {/* 
            CORREÇÃO CRÍTICA: 
            O erro "Error loading image with src: ... .mp4" acontece porque o componente <Img /> 
            está tentando carregar um arquivo de vídeo. 
            Vamos garantir que o componente correto seja usado baseado na extensão real do arquivo baixado.
        */}
        {(videoUrl.toLowerCase().endsWith('.mp4') || videoUrl.toLowerCase().endsWith('.mov')) ? (
          <OffthreadVideo src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Img src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </AbsoluteFill>

      {/* VINHETA PREMIUM (GRADIENTE TOPO E BASE PARA PROFUNDIDADE) */}
      <AbsoluteFill style={{ 
        background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.9) 100%)',
        zIndex: 2 
      }} />

      {/* TÍTULO GLASSMORPHISM PILL - HUD PREMIUM */}
      <div style={{
        position: 'absolute', 
        top: 80, 
        width: '100%', 
        display: 'flex',
        justifyContent: 'center',
        zIndex: 10
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          color: 'white',
          fontSize: '32px',
          fontWeight: '900',
          padding: '15px 50px',
          borderRadius: '100px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}>
          {title}
        </div>
      </div>

      {/* AUDIO ENGINE */}
      {backgroundMusicUrl && <Audio src={getMediaSource(backgroundMusicUrl)} volume={0.1} />}
      {narrationUrl && <Audio src={getMediaSource(narrationUrl)} volume={1.0} />}
    </AbsoluteFill>
  );
};