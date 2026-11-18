import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

type Headline = { text: string; start: number; length: number };
type Props = { images: string[]; voice: string; music?: string; logo?: string; headlines: Headline[]; durationInFrames: number };

export const PrimeReport: React.FC<Props> = ({images, voice, music, logo, headlines, durationInFrames}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const imageIndex = Math.min(images.length - 1, Math.floor(frame * images.length / durationInFrames));
  const currentImageStart = Math.floor(imageIndex * durationInFrames / images.length);
  const currentImageEnd = Math.floor((imageIndex + 1) * durationInFrames / images.length);
  const scale = interpolate(frame, [currentImageStart, Math.max(currentImageStart + 1, currentImageEnd)], [1, 1.045], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{backgroundColor: '#0a192f', fontFamily: 'Arial, sans-serif'}}>
    {images.map((image, index) => {
      const from = Math.floor(index * durationInFrames / images.length);
      const to = Math.floor((index + 1) * durationInFrames / images.length);
      return <Sequence key={image + index} from={from} durationInFrames={Math.max(1, to - from)}>
        <Img src={staticFile(image)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: index === imageIndex ? `scale(${scale})` : undefined}} />
      </Sequence>;
    })}
    {logo && <Img src={staticFile(logo)} style={{position: 'absolute', top: 35, left: 48, width: 250, objectFit: 'contain'}} />}
    {headlines.map((headline, index) => {
      const from = Math.floor(headline.start / 180 * durationInFrames);
      const end = Math.floor((headline.start + headline.length) / 180 * durationInFrames);
      return <Sequence key={index} from={from} durationInFrames={Math.max(1, Math.min(durationInFrames, end) - from)}>
        <div style={{position: 'absolute', left: '12%', width: '76%', bottom: 90}}>
          <div style={{display: 'table', background: '#d4af37', color: '#0a192f', fontSize: 23, fontWeight: 900, padding: '8px 15px'}}>BREAKING NEWS</div>
          <div style={{background: 'white', color: '#0a192f', borderLeft: '8px solid #0a192f', fontSize: 39, fontWeight: 900, padding: '18px 22px'}}>{headline.text}</div>
        </div>
      </Sequence>;
    })}
    <Audio src={staticFile(voice)} />
    {music && <Audio src={staticFile(music)} volume={frame => 0.12 * Math.min(1, frame / fps, Math.max(0, (durationInFrames - frame) / (fps * 2)))} />}
  </AbsoluteFill>;
};
