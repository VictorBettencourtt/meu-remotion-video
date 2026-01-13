import { AbsoluteFill, OffthreadVideo, Audio, staticFile } from 'remotion';

interface MyProps {
	videoUrl: string;
	title: string;
	backgroundMusicUrl: string;
}

export const MyShort: React.FC<MyProps> = ({ videoUrl, title, backgroundMusicUrl }) => {
	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			{/* CAMADA 1: FUNDO BORRADO */}
			<AbsoluteFill>
				<OffthreadVideo
					src={staticFile(videoUrl)} // staticFile resolve o erro 404
					muted
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						filter: 'blur(25px) brightness(0.4)',
						transform: 'scale(1.5)',
					}}
				/>
			</AbsoluteFill>

			{/* CAMADA 2: VÍDEO NO MEIO */}
			<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
				<OffthreadVideo
					src={staticFile(videoUrl)} // staticFile resolve o erro 404
					style={{
						width: '90%',
						borderRadius: '30px',
						border: '5px solid white',
						boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
					}}
				/>
			</AbsoluteFill>

			{/* CAMADA 3: ÁUDIO DO INSTAGRAM */}
			{backgroundMusicUrl && (
				<Audio 
					src={staticFile(backgroundMusicUrl)} // staticFile resolve o erro 404
					volume={0.3}
				/>
			)}

			{/* CAMADA 4: TÍTULO */}
			<div style={{
				position: 'absolute',
				top: 150,
				width: '100%',
				textAlign: 'center',
				fontSize: '60px',
				color: 'white',
				fontFamily: 'sans-serif',
				fontWeight: 'bold',
				textShadow: '0 0 15px black',
				padding: '0 40px'
			}}>
				{title}
			</div>
		</AbsoluteFill>
	);
};