import { AbsoluteFill, OffthreadVideo, useVideoConfig, interpolate, useCurrentFrame } from 'remotion';
import React from 'react';

export const MeuShort: React.FC<{
	videoSrc: string;
	title: string;
}> = ({ videoSrc, title }) => {
	const frame = useCurrentFrame();

	const opacity = interpolate(frame, [0, 15], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{ 
			backgroundColor: 'black',
			border: '12px solid #3b82f6',
			boxSizing: 'border-box'
		}}>
			<OffthreadVideo
				src={videoSrc}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
				}}
			/>
			<AbsoluteFill style={{
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
				flexDirection: 'column',
				padding: '60px'
			}}>
				<h1 style={{
					color: '#faff00',
					fontSize: '90px',
					fontWeight: 900,
					textAlign: 'center',
					fontFamily: 'system-ui, -apple-system, sans-serif',
					textShadow: '0 0 15px rgba(250, 255, 0, 0.8), 0 0 30px rgba(250, 255, 0, 0.6)',
					opacity,
					margin: 0,
					textTransform: 'uppercase',
					lineHeight: '1.1'
				}}>
					{title}
				</h1>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};