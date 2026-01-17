import { AbsoluteFill, OffthreadVideo, Audio, staticFile, interpolate, useCurrentFrame, useVideoConfig, Img } from 'remotion';
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
	isImage: boolean;
}> = ({ videoUrl, title, backgroundMusicUrl, isImage }) => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// EFEITO SCANNER: A imagem começa no topo e desce até o final
	const translateY = interpolate(frame, [0, durationInFrames], [0, -400]);
    // Zoom suave contínuo
	const zoom = interpolate(frame, [0, durationInFrames], [1.2, 1.4]);

	const mediaSrc = getMediaSource(videoUrl);

	return (
		<AbsoluteFill style={{ backgroundColor: '#050505', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
			
			{/* CAMADA 1: DESFOQUE DE FUNDO (AMBIENTE) */}
			<AbsoluteFill style={{ filter: 'blur(50px) brightness(0.2)', transform: 'scale(2)' }}>
				{isImage ? <Img src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <OffthreadVideo src={mediaSrc} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
			</AbsoluteFill>

			{/* CAMADA 2: CONTEÚDO TELA CHEIA COM ROLAGEM */}
			<AbsoluteFill style={{ overflow: 'hidden' }}>
				<div style={{
					width: '100%',
					height: '120%', // Maior que a tela para permitir o scroll
					transform: `translateY(${translateY}px) scale(${zoom})`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start'
				}}>
					{isImage ? (
						<Img src={mediaSrc} style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
					) : (
						<OffthreadVideo src={mediaSrc} style={{ width: '100%' }} />
					)}
				</div>
			</AbsoluteFill>

			{/* CAMADA 3: VINHETA (Escurece as bordas pra focar no centro) */}
			<AbsoluteFill style={{
				background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.8) 100%)',
				pointerEvents: 'none'
			}} />

			{/* CAMADA 4: LEGENDA FUTURISTA (ESTILO TECH BADGE) */}
			<div style={{
				position: 'absolute',
				top: 100,
				width: '100%',
				display: 'flex',
				justifyContent: 'center',
				padding: '0 40px'
			}}>
				<div style={{
					backgroundColor: 'rgba(255,255,255,0.95)',
					color: 'black',
					padding: '15px 40px',
					borderRadius: '4px', // Borda mais quadrada = mais tech
					boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
					borderLeft: '12px solid #3b82f6', // Detalhe azul lateral
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
				}}>
					<span style={{
						fontSize: '18px',
						fontWeight: 'bold',
						color: '#3b82f6',
						textTransform: 'uppercase',
						letterSpacing: '4px',
						marginBottom: '5px'
					}}>System Update</span>
					<span style={{
						fontSize: '42px',
						fontWeight: '900',
						lineHeight: '1',
						textAlign: 'center',
						textTransform: 'uppercase'
					}}>
						{title}
					</span>
				</div>
			</div>

			{/* ÁUDIO */}
			{backgroundMusicUrl && (
				<Audio src={getMediaSource(backgroundMusicUrl)} volume={0.15} />
			)}

		</AbsoluteFill>
	);
};