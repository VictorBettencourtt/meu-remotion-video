import { AbsoluteFill, OffthreadVideo, Audio, staticFile } from 'remotion';
import React from 'react';

const getMediaSource = (src: string) => {
  if (!src) return "";
  if (src.startsWith('http')) return src;
  return staticFile(src);
};

interface LongoProps {
  videoUrl: string;
  title: string;
  description: string;
  backgroundMusicUrl: string;
  layoutType: 'split-screen' | 'fullscreen' | 'pip';
  accentColor: string;
}

export const MeuVideoLongo: React.FC<LongoProps> = ({ 
  videoUrl, title, description, backgroundMusicUrl, layoutType, accentColor 
}) => {
  
  if (!videoUrl) return null;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a', fontFamily: 'system-ui, sans-serif', color: 'white' }}>
      
      {/* LAYOUT 1: SPLIT SCREEN (VÍDEO NA ESQUERDA, TEXTO NA DIREITA) */}
      {layoutType === 'split-screen' && (
        <AbsoluteFill style={{ flexDirection: 'row' }}>
          <div style={{ width: '65%', height: '100%', padding: '40px' }}>
             <div style={{ width: '100%', height: '100%', borderRadius: '20px', overflow: 'hidden', border: `4px solid ${accentColor}`, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                <OffthreadVideo src={getMediaSource(videoUrl)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
             </div>
          </div>
          <div style={{ width: '35%', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
             <h1 style={{ fontSize: '60px', fontWeight: '900', color: accentColor, marginBottom: '20px', lineHeight: '1' }}>{title}</h1>
             <p style={{ fontSize: '28px', opacity: 0.8, lineHeight: '1.4' }}>{description}</p>
          </div>
        </AbsoluteFill>
      )}

      {/* LAYOUT 2: FULLSCREEN COM OVERLAY */}
      {layoutType === 'fullscreen' && (
        <AbsoluteFill>
          <OffthreadVideo src={getMediaSource(videoUrl)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <AbsoluteFill style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.9) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', left: '80px', top: '0', bottom: '0', width: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
             <h1 style={{ fontSize: '80px', fontWeight: '900', lineHeight: '1' }}>{title}</h1>
             <div style={{ height: '10px', width: '100px', backgroundColor: accentColor, margin: '30px 0' }} />
             <p style={{ fontSize: '30px', opacity: 0.9 }}>{description}</p>
          </div>
        </AbsoluteFill>
      )}

      {/* LAYOUT 3: PIP (VÍDEO FLUTUANTE) */}
      {layoutType === 'pip' && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: `radial-gradient(circle, ${accentColor}33 0%, #000 100%)` }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '50px', fontWeight: 'bold' }}>{title}</h1>
          </div>
          <div style={{ width: '70%', aspectRatio: '16/9', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 50px 100px rgba(0,0,0,0.8)', border: '2px solid rgba(255,255,255,0.2)' }}>
            <OffthreadVideo src={getMediaSource(videoUrl)} style={{ width: '100%' }} />
          </div>
        </AbsoluteFill>
      )}

      <Audio src={getMediaSource(backgroundMusicUrl)} volume={0.2} />
    </AbsoluteFill>
  );
};