import { AbsoluteFill, OffthreadVideo, Audio, staticFile, interpolate, useCurrentFrame, useVideoConfig, Img } from 'remotion';
import React from 'react';

export const MyShort: React.FC<{
	videoUrl: string;
    imageUrl: string;
	title: string;
	backgroundMusicUrl: string;
	isImage: boolean;
}> = ({ videoUrl, imageUrl, title, backgroundMusicUrl, isImage }) => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	const zoom = interpolate(frame, [0, durationInFrames], [1, 1.15]);
	
	return (
		<AbsoluteFill style={{ backgroundColor: 'black', fontFamily: 'sans-serif' }}>
			
			{/* FUNDO AMBIENTE */}
			<AbsoluteFill style={{ filter: 'blur(30px) brightness(0.3)', transform: 'scale(1.4)' }}>
				{isImage ? (
					<Img src={staticFile(imageUrl)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
				) : (
					videoUrl && <OffthreadVideo src={staticFile(videoUrl)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
				)}
			</AbsoluteFill>

			{/* CONTEÚDO PRINCIPAL */}
			<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
				<div style={{
					width: '92%',
					borderRadius: '40px',
					overflow: 'hidden',
					border: '5px solid white',
					boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
					transform: isImage ? `scale(${zoom})` : 'none'
				}}>
					{isImage ? (
						<Img src={staticFile(imageUrl)} style={{ width: '100%' }} />
					) : (
						videoUrl && <OffthreadVideo src={staticFile(videoUrl)} style={{ width: '100%' }} />
					)}
				</div>
			</AbsoluteFill>

			{/* TÍTULO */}
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

			{backgroundMusicUrl && (
				<Audio src={staticFile(backgroundMusicUrl)} volume={0.15} />
			)}
		</AbsoluteFill>
	);
};