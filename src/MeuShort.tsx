import { AbsoluteFill, OffthreadVideo, Audio, staticFile, interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import React from 'react';

// Função para lidar com links locais ou remotos
const getMediaSource = (src: string) => {
  if (!src) return "";
  if (src.startsWith('http')) return src;
  return staticFile(src);
};

interface MasterProps {
  videoUrl: string;
  title: string;
  backgroundMusicUrl: string;
  layoutType: 'centralizado' | 'noticiario' | 'cinema';
  titleTop: number;
  titleSize: number;
  titleColor: string;
  borderRadius: number;
  blurAmount: number;
  videoScale: number;
  mostrarLogo: boolean;
  mostrarLegendaFundo: boolean;
}

export const MyShort: React.FC<MasterProps> = ({ 
  videoUrl, title, backgroundMusicUrl, layoutType, titleTop, 
  titleSize, titleColor, borderRadius, blurAmount, videoScale,
  mostrarLogo, mostrarLegendaFundo 
}) => {
  
  if (!videoUrl) return null;

  return (
    <AbsoluteFill style={{ backgroundColor: 'black', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* 1. FUNDO (Sempre presente, ajustável pelo blur) */}
      <AbsoluteFill>
        <OffthreadVideo
          src={getMediaSource(videoUrl)}
          muted
          style={{
            filter: `blur(${blurAmount}px) brightness(0.4)`,
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            transform: 'scale(1.5)',
          }}
        />
      </AbsoluteFill>

      {/* 2. OVERLAY DE GRADIENTE (Melhora leitura do texto) */}
      <AbsoluteFill style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%)'
      }} />

      {/* 3. VÍDEO PRINCIPAL (Muda de acordo com o Layout) */}
      <AbsoluteFill style={{ 
        justifyContent: layoutType === 'noticiario' ? 'flex-start' : 'center', 
        alignItems: 'center',
        paddingTop: layoutType === 'noticiario' ? '150px' : '0'
      }}>
        <div style={{
          width: `${videoScale * 100}%`,
          borderRadius: layoutType === 'cinema' ? '0px' : `${borderRadius}px`,
          overflow: 'hidden',
          border: layoutType === 'cinema' ? 'none' : `4px solid white`,
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
        }}>
          <OffthreadVideo
            src={getMediaSource(videoUrl)}
            style={{ width: '100%' }}
          />
        </div>
      </AbsoluteFill>

      {/* 4. TÍTULO DINÂMICO */}
      <div style={{
        position: 'absolute',
        top: layoutType === 'noticiario' ? 'auto' : titleTop,
        bottom: layoutType === 'noticiario' ? '200px' : 'auto',
        width: '100%',
        textAlign: 'center',
        fontSize: `${titleSize}px`,
        color: titleColor,
        fontWeight: '900',
        padding: '0 60px',
        textTransform: 'uppercase',
        lineHeight: '1.1',
        textShadow: '0 10px 20px rgba(0,0,0,0.8)',
        backgroundColor: mostrarLegendaFundo && layoutType === 'noticiario' ? 'rgba(0,0,0,0.8)' : 'transparent',
        paddingTop: layoutType === 'noticiario' ? '40px' : '0',
        paddingBottom: layoutType === 'noticiario' ? '40px' : '0'
      }}>
        {title}
      </div>

      {/* 5. LOGO (Opcional) */}
      {mostrarLogo && (
        <div style={{
          position: 'absolute',
          top: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          fontSize: '30px',
          fontWeight: 'bold',
          opacity: 0.8,
          border: '2px solid white',
          padding: '10px 20px'
        }}>
          VICTOR BETTENCOURT
        </div>
      )}

      {/* 6. ÁUDIO */}
      {backgroundMusicUrl && (
        <Audio src={getMediaSource(backgroundMusicUrl)} volume={0.3} />
      )}

		</AbsoluteFill>
	);
};
