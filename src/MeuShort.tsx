import { AbsoluteFill, OffthreadVideo, Audio, staticFile, interpolate, useCurrentFrame } from 'remotion';
import React from 'react';

export const MyShort: React.FC<{
	videoUrl: string;
	title: string;
	backgroundMusicUrl: string;
	isImage?: boolean;
}> = ({ videoUrl, title, backgroundMusicUrl, isImage }) => {
	const frame = useCurrentFrame();
	const zoom = interpolate(frame, [0, 450], [1, 1.15]);
	const mediaSrc = videoUrl?.startsWith('http') ? videoUrl : staticFile(videoUrl);

	return (
		<AbsoluteFill style={{ backgroundColor: 'black', fontFamily: 'sans-serif' }}>
			<AbsoluteFill style={{ filter: 'blur(25px) brightness(0.3)', transform: 'scale(1.3)' }}>
				{isImage ? <img src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <OffthreadVideo src={mediaSrc} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
			</AbsoluteFill>
			<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
				<div style={{ width: '92%', borderRadius: '40px', overflow: 'hidden', border: '5px solid white', boxShadow: '0 30px 80px rgba(0,0,0,0.7)', transform: isImage ? `scale(${zoom})` : 'none' }}>
					{isImage ? <img src={mediaSrc} style={{ width: '100%' }} /> : <OffthreadVideo src={mediaSrc} style={{ width: '100%' }} />}
				</div>
			</AbsoluteFill>
			<div style={{ position: 'absolute', top: 120, width: '100%', textAlign: 'center', color: 'white', fontSize: '70px', fontWeight: '900', padding: '0 50px', textShadow: '0 10px 30px black', textTransform: 'uppercase', lineHeight: '1' }}>
				{title}
			</div>
			{backgroundMusicUrl && <Audio src={backgroundMusicUrl.startsWith('http') ? backgroundMusicUrl : staticFile(backgroundMusicUrl)} volume={0.15} />}
		</AbsoluteFill>
	);
};
