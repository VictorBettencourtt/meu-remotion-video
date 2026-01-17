import { AbsoluteFill, OffthreadVideo, Audio, staticFile, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
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
}> = ({ videoUrl, title, backgroundMusicUrl }) => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	
	// Movimento de zoom lento
	const zoom = interpolate(frame, [0, durationInFrames], [1, 1.1]);

	return (
		<AbsoluteFill style={{ backgroundColor: 'black', fontFamily: 'sans-serif' }}>
			
			{/* CAMADA 1: FUNDO BORRADO */}
			<AbsoluteFill style={{ filter: 'blur(25px) brightness(0.3)', transform: 'scale(1.4)' }}>
				<OffthreadVideo 
					src={staticFile(videoUrl)} 
					muted 
					style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
				/>
			</AbsoluteFill>

			{/* CAMADA 2: VÍDEO CENTRAL */}
			<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
				<div style={{
					width: '92%',
					borderRadius: '40px',
					overflow: 'hidden',
					border: '5px solid white',
					boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
                    transform: `scale(${zoom})`
				}}>
					<OffthreadVideo src={staticFile(videoUrl)} style={{ width: '100%' }} />
				</div>
			</AbsoluteFill>

			{/* CAMADA 3: TÍTULO */}
			<div style={{
				position: 'absolute',
				top: 120,
				width: '100%',
				textAlign: 'center',
				color: 'white',
				fontSize: '70px',
				fontWeight: '900',
				padding: '0 50px',
				textShadow: '0 10px 30px black',
				textTransform: 'uppercase',
				lineHeight: '1'
			}}>
				{title}
			</div>

			{/* ÁUDIO */}
			{backgroundMusicUrl && (
				<Audio src={staticFile(backgroundMusicUrl)} volume={0.2} />
			)}
		</AbsoluteFill>
	);
};