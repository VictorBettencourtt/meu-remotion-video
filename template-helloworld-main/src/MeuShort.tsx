import { AbsoluteFill, Video } from 'remotion';

interface MyProps {
	videoUrl: string;
	title: string;
}

export const MyShort: React.FC<MyProps> = ({ videoUrl, title }) => {
	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			{/* CAMADA 1: FUNDO BORRADO */}
			<AbsoluteFill>
				<Video
					src={videoUrl}
					muted
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						filter: 'blur(20px) brightness(0.4)',
						transform: 'scale(1.5)',
					}}
				/>
			</AbsoluteFill>

			{/* CAMADA 2: VÍDEO NO MEIO */}
			<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
				<Video
					src={videoUrl}
					style={{
						width: '90%',
						borderRadius: '30px',
						border: '5px solid white'
					}}
				/>
			</AbsoluteFill>

			{/* CAMADA 3: TÍTULO */}
			<div style={{
				position: 'absolute',
				top: 150,
				width: '100%',
				textAlign: 'center',
				fontSize: '60px',
				color: 'white',
				fontFamily: 'sans-serif',
				fontWeight: 'bold',
				textShadow: '0 0 15px black'
			}}>
				{title}
			</div>
		</AbsoluteFill>
	);
};