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

	// 1. EFEITO DE ENTRADA (MOLA)
	const entrance = spring({
		frame,
		fps,
		config: { damping: 12 },
	});

	// 2. ANIMAÇÃO NATE HERK: "SCAN" E "ZOOM DINÂMICO"
	// O vídeo começa em 1.1x e termina em 1.4x de zoom
	const scale = interpolate(frame, [0, durationInFrames], [1.1, 1.4]);
	
	// Ele começa um pouco para cima e termina um pouco para baixo (efeito de rolagem)
	const translateY = interpolate(frame, [0, durationInFrames], [30, -80]);
	
	// Um leve balanço pro lado pra não parecer robótico
	const rotate = interpolate(frame, [0, durationInFrames], [-1, 1]);

	const mediaSrc = getMediaSource(videoUrl);

	return (
		<AbsoluteFill style={{ backgroundColor: '#020617', fontFamily: 'system-ui, sans-serif' }}>
			
			{/* CAMADA 1: FUNDO AMBIENTE COM BLUR PESADO */}
			<AbsoluteFill style={{ filter: 'blur(40px) brightness(0.2)', transform: 'scale(1.8)' }}>
				{isImage ? (
					<img src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
				) : (
					<OffthreadVideo src={mediaSrc} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
				)}
			</AbsoluteFill>

			{/* CAMADA 2: MOLDURA "GLASSMORFISM" */}
			<AbsoluteFill style={{ 
				justifyContent: 'center', 
				alignItems: 'center',
				transform: `scale(${entrance})`,
				opacity: entrance
			}}>
				<div style={{
					width: '92%',
					height: '65%',
					borderRadius: '40px',
					overflow: 'hidden',
					border: '2px solid rgba(255,255,255,0.2)',
					boxShadow: '0 50px 100px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.05)',
					backgroundColor: '#0f172a'
				}}>
					{/* O CONTEÚDO COM MOVIMENTO DE CÂMERA DINÂMICA */}
					<div style={{
						width: '100%',
						height: '100%',
						transform: isImage ? `scale(${scale}) translateY(${translateY}px) rotate(${rotate}deg)` : 'none'
					}}>
						{isImage ? (
							<img src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
						) : (
							<OffthreadVideo src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
						)}
					</div>
				</div>
			</AbsoluteFill>

			{/* CAMADA 3: TÍTULO BADGE (ANIME DE BAIXO PRA CIMA) */}
			<div style={{
				position: 'absolute',
				top: 100,
				width: '100%',
				textAlign: 'center',
				padding: '0 40px',
				transform: `translateY(${(1 - entrance) * -50}px)`,
				opacity: entrance
			}}>
				<span style={{
					backgroundColor: 'white',
					color: 'black',
					padding: '12px 35px',
					fontSize: '48px',
					fontWeight: '900',
					borderRadius: '20px',
					boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
					display: 'inline-block',
					lineHeight: '1.2',
					textTransform: 'uppercase'
				}}>
					{title}
				</span>
			</div>

			{/* ÁUDIO */}
			{backgroundMusicUrl && (
				<Audio src={getMediaSource(backgroundMusicUrl)} volume={0.12} />
			)}

		</AbsoluteFill>
	);
};