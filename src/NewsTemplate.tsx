import { AbsoluteFill, OffthreadVideo, Audio, staticFile, useCurrentFrame, interpolate, Sequence } from 'remotion';
import React from 'react';

const getMediaSource = (src: string) => {
	if (!src) return "";
	if (src.startsWith('http')) return src;
	return staticFile(src);
};

interface NewsProps {
	videoUrl: string;
	audioUrl: string;
	headline: string;
	subHeadline: string;
	logoUrl: string; // Ex: Prime Report
}

export const NewsTemplate: React.FC<NewsProps> = ({ 
	videoUrl, audioUrl, headline, subHeadline, logoUrl 
}) => {
	const frame = useCurrentFrame();

	// Animação de entrada do Banner (sobe de baixo pra cima)
	const bannerY = interpolate(frame, [0, 15], [200, 0], { extrapolateRight: 'clamp' });
	const bannerOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

	return (
		<AbsoluteFill style={{ backgroundColor: 'black', fontFamily: 'Arial, sans-serif' }}>
			
			{/* VÍDEO DE FUNDO */}
			<AbsoluteFill>
				<OffthreadVideo
					src={getMediaSource(videoUrl)}
					style={{ width: '100%', height: '100%', objectFit: 'cover' }}
				/>
			</AbsoluteFill>

			{/* LOGO NO CANTO SUPERIOR ESQUERDO */}
			<div style={{ position: 'absolute', top: 40, left: 40, display: 'flex', alignItems: 'center', gap: '10px' }}>
				<div style={{ color: 'white', fontWeight: 'bold', fontSize: '24px', letterSpacing: '2px' }}>
					PRIME<span style={{ color: '#ffc107' }}>REPORT</span>
				</div>
			</div>

			{/* BANNER DE NOTÍCIAS (LOWER THIRD) */}
			<div style={{
				position: 'absolute',
				bottom: 100,
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				transform: `translateY(${bannerY}px)`,
				opacity: bannerOpacity
			}}>
				{/* ETIQUETA BREAKING NEWS */}
				<div style={{
					backgroundColor: '#ffc107',
					color: 'black',
					padding: '5px 20px',
					fontSize: '18px',
					fontWeight: 'bold',
					textTransform: 'uppercase',
					marginBottom: '-5px',
					zIndex: 2
				}}>
					Breaking News
				</div>

				{/* BOX DA MANCHETE */}
				<div style={{
					backgroundColor: 'white',
					width: '90%',
					padding: '20px',
					textAlign: 'center',
					boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
				}}>
					<h1 style={{ margin: 0, color: '#1a1a1a', fontSize: '32px', textTransform: 'uppercase', fontWeight: '900' }}>
						{headline}
					</h1>
					<div style={{ height: '2px', backgroundColor: '#ddd', margin: '15px 0' }} />
					<h2 style={{ margin: 0, color: '#444', fontSize: '24px', fontWeight: '600' }}>
						{subHeadline}
					</h2>
				</div>
			</div>

			{/* ÁUDIO DA DUBLAGEM */}
			<Audio src={getMediaSource(audioUrl)} volume={1} />
		</AbsoluteFill>
	);
};