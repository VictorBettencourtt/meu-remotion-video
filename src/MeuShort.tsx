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
      {/* CAMADA 1: FUNDO BORRADO */}
      <AbsoluteFill>
          <OffthreadVideo
              src={getMediaSource(videoUrl)}
              muted
              style={{
                  filter: `blur(${blurAmount}px) brightness(0.3)`,
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%',
                  transform: 'scale(1.3)',
              }}
          />
      </AbsoluteFill>

      {/* CAMADA 2: OVERLAY DE GRADIENTE (Para o texto ler melhor) */}
      <AbsoluteFill style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.8) 100%)'
      }} />

      {/* CAMADA 3: VÍDEO CENTRAL COM BORDA NEON */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{
              width: '90%',
              borderRadius: `${borderRadius}px`,
              overflow: 'hidden',
              boxShadow: `0 0 40px ${titleColor}66`, // Neon suave da cor do título
              border: `4px solid ${titleColor}`,
          }}>
              <OffthreadVideo
                  src={getMediaSource(videoUrl)}
                  style={{ width: '100%' }}
              />
          </div>
      </AbsoluteFill>

      {/* CAMADA 4: TÍTULO COM FONTE MODERNA */}
      <div style={{
          position: 'absolute',
          top: titleTop,
          width: '100%',
          textAlign: 'center',
          fontSize: `${titleSize}px`,
          color: titleColor,
          fontFamily: 'system-ui, sans-serif',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '-2px',
          padding: '0 60px',
          lineHeight: '1',
      }}>
          {title}
      </div>
  </AbsoluteFill>
  );
};