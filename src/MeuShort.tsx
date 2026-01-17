import { AbsoluteFill, OffthreadVideo, Audio, staticFile, interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion';
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
	isImage?: boolean;
}> = ({ videoUrl, title, backgroundMusicUrl, isImage }) => {
	const frame = useCurrentFrame();
	const { fps, durationInFrames } = useVideoConfig();

	// Animação de entrada (Pop)
	const entrance = spring({ frame, fps, config: { damping: 12 } });

	// MOVIMENTO AGRESSIVO (Para ser visível em vídeos curtos)
	// Zoom de 1.1x para 1.5x
	const scale = interpolate(frame, [0, durationInFrames], [1.1, 1.5]);
	// Movimento de subida mais forte
	const translateY = interpolate(frame, [0, durationInFrames], [50, -100]);
	// Rotação para dar o estilo "Handheld"
	const rotate = interpolate(frame, [0, durationInFrames], [-2, 2]);

	const mediaSrc = getMediaSource(videoUrl);

	return (
		<AbsoluteFill style={{ backgroundColor: '#000', fontFamily: 'system-ui, sans-serif' }}>
			
			{/* FUNDO BORRADO */}
			<AbsoluteFill style={{ filter: 'blur(30px) brightness(0.2)', transform: 'scale(1.5)' }}>
				{isImage || videoUrl.includes('assets') ? (
					<img src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
				) : (
					<OffthreadVideo src={mediaSrc} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
				)}
			</AbsoluteFill>

			{/* BOX CENTRAL COM MOVIMENTO */}
			<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
				<div style={{
					width: '92%',
					height: '65%',
					borderRadius: '40px',
					overflow: 'hidden',
					border: '6px solid white',
					boxShadow: '0 50px 100px rgba(0,0,0,0.9)',
					transform: `scale(${entrance})`,
					opacity: entrance,
                    backgroundColor: '#1a1a1a'
				}}>
					<div style={{
						width: '100%',
						height: '100%',
						transform: `scale(${scale}) translateY(${translateY}px) rotate(${rotate}deg)`
					}}>
						{isImage || videoUrl.includes('assets') ? (
							<img src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
						) : (
							<OffthreadVideo src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
						)}
					</div>
				</div>
			</AbsoluteFill>

			{/* TÍTULO ESTILIZADO */}
			<div style={{
				position: 'absolute',
				top: 80,
				width: '100%',
				textAlign: 'center',
				padding: '0 40px',
				opacity: entrance,
				transform: `translateY(${(1 - entrance) * -50}px)`
			}}>
				<span style={{
					backgroundColor: 'white',
					color: 'black',
					padding: '15px 40px',
					fontSize: '42px',
					fontWeight: '900',
					borderRadius: '25px',
					boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
					display: 'inline-block',
					lineHeight: '1.2'
				}}>
					{title}
				</span>
			</div>

			{backgroundMusicUrl && <Audio src={getMediaSource(backgroundMusicUrl)} volume={0.15} />}
		</AbsoluteFill>
	);
};