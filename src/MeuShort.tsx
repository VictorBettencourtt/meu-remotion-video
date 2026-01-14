import { AbsoluteFill, OffthreadVideo, Audio, staticFile } from 'remotion';

// Função auxiliar para não quebrar com links da internet
const getMediaSource = (src: string) => {
  if (src.startsWith('http')) return src;
  return staticFile(src);
};

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
  
  // Se não tiver vídeo nas props, não renderiza pra não dar erro
  if (!videoUrl) return null;

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {/* FUNDO DINÂMICO */}
      <AbsoluteFill>
        <OffthreadVideo
          src={getMediaSource(videoUrl)}
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
          src={getMediaSource(videoUrl)}
          style={{ 
            width: '90%', 
            borderRadius: `${borderRadius}px`,
            border: '5px solid white' 
          }}
        />
      </AbsoluteFill>

      {/* TÍTULO DINÂMICO */}
      <div style={{
        position: 'absolute',
        top: titleTop,
        width: '100%',
        textAlign: 'center',
        fontSize: `${titleSize}px`,
        color: titleColor,
        fontWeight: 'bold',
        padding: '0 40px',
        textShadow: '0 0 15px black'
      }}>
        {title}
      </div>

      {backgroundMusicUrl && (
        <Audio src={getMediaSource(backgroundMusicUrl)} volume={0.3} />
      )}
    </AbsoluteFill>
  );
};