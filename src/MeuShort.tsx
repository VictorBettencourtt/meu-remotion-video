import { AbsoluteFill, OffthreadVideo, Audio, staticFile } from 'remotion';

export const MyShort: React.FC<{
  videoUrl: string;
  title: string;
  backgroundMusicUrl: string;
  titleTop: number;
  titleSize: number;
  titleColor: string;
  borderRadius: number;
  blurAmount: number;
}> = ({ videoUrl, title, backgroundMusicUrl, titleTop, titleSize, titleColor, borderRadius, blurAmount }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {/* FUNDO DINÂMICO */}
      <AbsoluteFill>
        <OffthreadVideo
          src={staticFile(videoUrl)}
          muted
          style={{
            filter: `blur(${blurAmount}px) brightness(0.4)`,
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            transform: 'scale(1.5)',
          }}
        />
      </AbsoluteFill>

      {/* VÍDEO CENTRAL DINÂMICO */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <OffthreadVideo
          src={staticFile(videoUrl)}
          style={{ 
            width: '90%', 
            borderRadius: `${borderRadius}px`, // Slider controla isso
            border: '5px solid white' 
          }}
        />
      </AbsoluteFill>

      {/* TÍTULO DINÂMICO */}
      <div style={{
        position: 'absolute',
        top: titleTop, // Slider controla isso
        width: '100%',
        textAlign: 'center',
        fontSize: `${titleSize}px`, // Slider controla isso
        color: titleColor, // Color picker controla isso
        fontWeight: 'bold',
        padding: '0 40px'
      }}>
        {title}
      </div>

      <Audio src={staticFile(backgroundMusicUrl)} volume={0.3} />
    </AbsoluteFill>
  );
};