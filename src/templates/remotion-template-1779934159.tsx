import React from 'react';
import {AbsoluteFill, Composition } from 'remotion';

export const RemotionTemplate1779934159: React.FC<any> = ({ title = 'Generated Title', script = '', images = [], ticker = [] }) => {
  const imagesToShow = Array.isArray(images) ? images : [];
  return (
    <AbsoluteFill style={{ backgroundColor: '#071029', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ padding: 60, maxWidth: 1280, margin: '0 auto' }}>
        <h1 style={{ fontSize: 56, marginBottom: 20 }}>{title}</h1>
        <div style={{ fontSize: 28, lineHeight: 1.6 }}>
          {String(script).split('\n').map((line: string, i: number) => (
            <p key={i} style={{ margin: '8px 0' }}>{line}</p>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 24, overflowX: 'auto' }}>
          {imagesToShow.map((src: string, i: number) => (
            <img key={i} src={src} style={{ width: 320, height: 180, objectFit: 'cover', borderRadius: 8 }} />
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ background: '#D4AF37', color: '#071029', padding: '8px 16px', fontWeight: 900 }}>BREAKING</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {ticker && ticker.slice(0,5).map((t: string, i: number) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 10px', borderRadius: 6, fontSize: 18, textTransform: 'uppercase' }}>{t}</div>
          ))}
        </div>
        <div>Prime Report</div>
      </div>
    </AbsoluteFill>
  );
};

export const RemotionTemplate1779934159Composition: React.FC = () => null;

export default RemotionTemplate1779934159;
