import { AbsoluteFill, OffthreadVideo, Audio, staticFile, interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import React from 'react';

export const MyShort: React.FC<{
	videoUrl: string;
	title: string;
	backgroundMusicUrl: string;
	isImage?: boolean;
}> = ({ videoUrl, title, backgroundMusicUrl, isImage }) => {
	const frame = useCurrentFrame();
	const { fps, durationInFrames } = useVideoConfig();

	// EFEITO NATE HERK: Câmera que passeia pela imagem
	// 1. Zoom inicial suave
	const scale = interpolate(frame, [0, durationInFrames], [1.1, 1.4]);
	
	// 2. Movimento lateral (Pan) para dar vida à imagem estática
	const translateX = interpolate(frame, [0, durationInFrames], [0, -50]);
	const translateY = interpolate(frame, [0, durationInFrames], [0, 30]);

	const mediaSrc = videoUrl?.startsWith('http') ? videoUrl : staticFile(videoUrl);

	return (
		<AbsoluteFill style={{ backgroundColor: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
			
			{/* FUNDO AMBIENTE */}
			<AbsoluteFill style={{ filter: 'blur(30px) brightness(0.2)', transform: 'scale(1.5)' }}>
				{isImage ? (
					<img src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
				) : (
					<OffthreadVideo src={mediaSrc} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
				)}
			</AbsoluteFill>

			{/* MOLDURA TIPO "DISPOSITIVO" */}
			<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
				<div style={{
					width: '94%',
					height: '70%',
					borderRadius: '40px',
					overflow: 'hidden',
					border: '6px solid rgba(255,255,255,0.1)',
					boxShadow: '0 50px 100px rgba(0,0,0,0.9)',
					backgroundColor: '#1e293b'
				}}>
					{/* O CONTEÚDO COM MOVIMENTO DE CÂMERA */}
					<div style={{
						width: '100%',
						height: '100%',
						transform: isImage ? `scale(${scale}) translateX(${translateX}px) translateY(${translateY}px)` : 'none'
					}}>
						{isImage ? (
							<img src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
						) : (
							<OffthreadVideo src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
						)}
					</div>
				</div>
			</AbsoluteFill>

			{/* TÍTULO ESTILO "NEWS OVERLAY" */}
			<div style={{
				position: 'absolute',
				top: 80,
				width: '100%',
				textAlign: 'center',
				padding: '0 40px'
			}}>
				<span style={{
					backgroundColor: 'white',
					color: 'black',
					padding: '10px 30px',
					fontSize: '45px',
					fontWeight: '900',
					borderRadius: '15px',
					boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
					display: 'inline-block',
					lineHeight: '1.2'
				}}>
					{title}
				</span>
			</div>

			{/* ÁUDIO */}
			{backgroundMusicUrl && (
				<Audio src={backgroundMusicUrl.startsWith('http') ? backgroundMusicUrl : staticFile(backgroundMusicUrl)} volume={0.15} />
			)}

		</AbsoluteFill>
	);
};
