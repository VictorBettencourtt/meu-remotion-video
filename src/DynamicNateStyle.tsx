import { AbsoluteFill, Audio, staticFile, interpolate, useCurrentFrame, useVideoConfig, Img, OffthreadVideo, random } from 'remotion';
import React from 'react';

const getMediaSource = (src: string) => {
    if (!src) return "";
    if (src.startsWith('http')) return src;
    return staticFile(src);
};

export const DynamicNateStyle: React.FC<{
    videoUrl: string;
    title: string;
    backgroundMusicUrl: string;
    narrationUrl?: string;
    captionText?: string;
    caption?: string;
    captions?: { text: string; start: number; end: number }[];
    isImage?: boolean;
    durationInFrames?: number;
}> = ({ videoUrl, title, backgroundMusicUrl, narrationUrl, captionText, caption, captions, durationInFrames: propDuration }) => {
    const frame = useCurrentFrame();
    const { durationInFrames: configDuration, width, height, fps } = useVideoConfig();
    const durationInFrames = propDuration || configDuration;

    // CAPTION LOGIC
    let parsedCaptions = captions;
    if (!parsedCaptions && caption) {
        try {
            parsedCaptions = JSON.parse(caption);
        } catch (e) {
            console.error("Failed to parse caption prop:", e);
        }
    }

    const currentTimeMs = (frame / fps) * 1000;
    const currentCaption = parsedCaptions?.find(c => currentTimeMs >= c.start && currentTimeMs <= c.end)?.text || captionText;

    // DETERMINE ASPECT RATIO
    const aspectRatio = width / height;
    const isPortrait = aspectRatio < 1;
    const isLandscape = aspectRatio > 1;
    const isSquare = aspectRatio === 1;

    // DYNAMIC SIZING CONFIGURATION
    // Base font size calculation
    const fontSize = Math.min(width, height) * 0.05; // 5% of smallest dimension

    // 3D Container Sizing
    let containerWidth = '90%';
    let containerHeight = '80%';
    let titleTop = 60;

    if (isPortrait) {
        containerWidth = '90%';
        containerHeight = '65%'; // Shorter container to fit title
        titleTop = height * 0.15; // Title lower down
    } else if (isLandscape) {
        containerWidth = '80%';
        containerHeight = '80%';
        titleTop = height * 0.05;
    }

    // PERSPECTIVA 3D DINÂMICA
    const rotateX = interpolate(frame, [0, durationInFrames], [5, -5]);
    const rotateY = interpolate(frame, [0, durationInFrames], [-5, 5]);
    const zoom = interpolate(frame, [0, durationInFrames], [1.1, 1.3]);

    // ANIMAÇÃO DE RESPIRAÇÃO PARA A AURORA
    const auroraMoveX = interpolate(Math.sin(frame / 60), [-1, 1], [-20, 20]);
    const auroraMoveY = interpolate(Math.cos(frame / 60), [-1, 1], [-15, 15]);



    // ANIMAÇÃO DE GLITCH (PRIMEIRO SEGUNDO)
    const glitchOpacity = frame < 30 ? (random(frame) > 0.8 ? 0.2 : 1) : 1;

    const mediaSrc = getMediaSource(videoUrl);
    const isVideo = videoUrl.toLowerCase().includes('.mp4') || videoUrl.toLowerCase().includes('.mov');

    return (
        <AbsoluteFill style={{ backgroundColor: '#020617', fontFamily: 'system-ui' }}>

            {/* AURORA TECH EFFECT - OPTIMIZED */}
            <AbsoluteFill style={{ overflow: 'hidden', zIndex: 0 }}>
                {/* Blue - Top Right */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-10%',
                    width: '70%',
                    height: '70%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(0,0,0,0) 70%)',
                    transform: `translate(${auroraMoveX}px, ${auroraMoveY}px)`
                }} />

                {/* Purple - Bottom Left */}
                <div style={{
                    position: 'absolute',
                    bottom: '-10%',
                    left: '-10%',
                    width: '70%',
                    height: '70%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(0,0,0,0) 70%)',
                    transform: `translate(${-auroraMoveX}px, ${-auroraMoveY}px)`
                }} />

                {/* Neon Yellow - Center */}
                <div style={{
                    position: 'absolute',
                    top: '25%',
                    left: '25%',
                    width: '50%',
                    height: '50%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(250,255,0,0.15) 0%, rgba(0,0,0,0) 70%)',
                    transform: `translate(${auroraMoveY}px, ${auroraMoveX}px)`
                }} />
            </AbsoluteFill>

            {/* BACKGROUND REFLECTION - OPTIMIZED */}
            <AbsoluteFill style={{
                zIndex: 1,
                opacity: 0.2,
                transform: 'scale(1.2)', // Slightly smaller scale to save pixels
                filter: 'brightness(0.3)' // Just darken, no blur
            }}>
                {isVideo ? (
                    <OffthreadVideo src={mediaSrc} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <Img src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
            </AbsoluteFill>

            {/* CONTAINER DE PERSPECTIVA 3D */}
            <AbsoluteFill style={{
                justifyContent: 'center',
                alignItems: 'center',
                perspective: '1200px',
                zIndex: 2,
                paddingTop: isPortrait ? '15%' : '0' // Padding for portrait mode title space
            }}>
                <div style={{
                    width: containerWidth,
                    height: containerHeight,
                    borderRadius: '30px',
                    border: '1px solid rgba(59,130,246,0.3)',
                    boxShadow: '0 80px 150px rgba(0,0,0,0.8), 0 0 40px rgba(59,130,246,0.1)',
                    backgroundColor: '#000',
                    overflow: 'hidden',
                    position: 'relative',
                    transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1)`
                }}>
                    <div style={{
                        transform: `scale(${zoom})`,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'flex-start'
                    }}>
                        {isVideo ? (
                            <OffthreadVideo src={mediaSrc} style={{ width: '100%', objectFit: 'cover' }} />
                        ) : (
                            <Img src={mediaSrc} style={{ width: '100%', objectFit: 'cover' }} />
                        )}
                    </div>
                </div>
            </AbsoluteFill>

            {/* VINHETA CINEMÁTICA */}
            <AbsoluteFill style={{
                background: 'linear-gradient(180deg, rgba(2,6,23,0.7) 0%, transparent 30%, transparent 70%, rgba(2,6,23,0.7) 100%)',
                pointerEvents: 'none',
                zIndex: 3
            }} />

            {/* TÍTULO HUD FUTURISTA */}
            <div style={{
                position: 'absolute',
                top: titleTop,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                zIndex: 10,
                opacity: glitchOpacity
            }}>
                <div style={{
                    background: 'rgba(2,6,23,0.85)', // Higher opacity instead of blur
                    padding: `${fontSize * 0.5}px ${fontSize * 1.5}px`,
                    border: '1px solid #3b82f6',
                    position: 'relative',
                    boxShadow: '0 0 30px rgba(59,130,246,0.2)',
                    maxWidth: '90%'
                }}>

                    {/* CANTO VIVO ESQUERDO (BRACKET) */}
                    <div style={{
                        position: 'absolute',
                        top: -2,
                        left: -2,
                        width: '15px',
                        height: '15px',
                        borderTop: '3px solid #3b82f6',
                        borderLeft: '3px solid #3b82f6'
                    }} />

                    {/* CANTO VIVO DIREITO (BRACKET) */}
                    <div style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        width: '15px',
                        height: '15px',
                        borderTop: '3px solid #3b82f6',
                        borderRight: '3px solid #3b82f6'
                    }} />

                    <span style={{
                        color: '#fff',
                        fontSize: `${fontSize}px`,
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        textShadow: '0 0 10px rgba(59,130,246,0.5)',
                        textAlign: 'center',
                        display: 'block'
                    }}>
                        {title}
                    </span>
                </div>
            </div>

            {/* CAPTIONS AREA */}
            {currentCaption && (
                <div style={{
                    position: 'absolute',
                    bottom: '10%',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    zIndex: 10,
                    opacity: frame > 20 ? 1 : 0 // Fade in slightly later
                }}>
                    <div style={{
                        background: 'rgba(0,0,0,0.85)', // Higher opacity instead of blur
                        padding: '10px 20px',
                        borderRadius: '10px',
                        maxWidth: '80%',
                        textAlign: 'center'
                    }}>
                        <span style={{
                            color: '#fbbf24', // Amber/Yellow for visibility
                            fontSize: `${fontSize * 0.6}px`,
                            fontWeight: '700',
                            fontFamily: 'monospace', // Tech feel
                            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                        }}>
                            {currentCaption}
                        </span>
                    </div>
                </div>
            )}

            {/* AUDIO ENGINE */}
            {backgroundMusicUrl && <Audio src={getMediaSource(backgroundMusicUrl)} volume={0.1} />}
            {narrationUrl && <Audio src={getMediaSource(narrationUrl)} volume={1.0} />}
        </AbsoluteFill>
    );
};
