import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type TimelineClip = {
  start: number;
  length: number;
  position?: string;
  fit?: string;
  scale?: number;
  asset: {
    type: string;
    src?: string;
    text?: string;
    volume?: number;
    speed?: number;
    font?: { color?: string; family?: string; size?: number; lineHeight?: number };
    stroke?: { color?: string; width?: number };
  };
};

type TimelineProps = {
  timeline: { background?: string; tracks: Array<{ clips: TimelineClip[] }> };
};

const TimelineAsset: React.FC<{ clip: TimelineClip }> = ({ clip }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { asset } = clip;
  const source = asset.src || '';
  const fit = clip.fit === 'contain' ? 'contain' : 'cover';

  if (asset.type === 'audio') {
    return <Audio src={source} volume={asset.volume ?? 1} />;
  }

  if (asset.type === 'caption' || asset.text) {
    const fontSize = asset.font?.size ?? 58;
    const position = clip.position === 'top'
      ? { top: 70 }
      : clip.position === 'center'
        ? { top: '45%', transform: 'translateY(-50%)' }
        : { bottom: 70 };
    const opacity = interpolate(
      frame,
      [0, Math.min(8, durationInFrames / 2), Math.max(8, durationInFrames - 8), durationInFrames],
      [0, 1, 1, 0],
      { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
    );
    return (
      <div style={{
        position: 'absolute',
        left: '6%',
        right: '6%',
        ...position,
        color: asset.font?.color ?? '#fff',
        fontFamily: asset.font?.family ?? 'Arial, sans-serif',
        fontSize,
        lineHeight: asset.font?.lineHeight ?? 1,
        fontWeight: 800,
        textAlign: 'center',
        whiteSpace: 'pre-wrap',
        textShadow: '0 3px 8px rgba(0,0,0,.95)',
        WebkitTextStroke: `${asset.stroke?.width ?? 1}px ${asset.stroke?.color ?? '#000'}`,
        opacity,
      }}>{asset.text ?? ''}</div>
    );
  }

  if (asset.type === 'video') {
    return (
      <AbsoluteFill>
        <OffthreadVideo
          src={source}
          playbackRate={asset.speed ?? 1}
          style={{ width: '100%', height: '100%', objectFit: fit }}
        />
      </AbsoluteFill>
    );
  }

  if (asset.type === 'image') {
    const progress = frame / Math.max(1, durationInFrames);
    const scale = (clip.scale ?? 1) + progress * 0.08;
    return (
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <Img
          src={source}
          style={{ width: '100%', height: '100%', objectFit: fit, transform: `scale(${scale})` }}
        />
      </AbsoluteFill>
    );
  }

  return <AbsoluteFill style={{ backgroundColor: '#111' }} />;
};

export const TimelineComposition: React.FC<TimelineProps> = ({ timeline }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const tracks = timeline?.tracks ?? [];
  return (
    <AbsoluteFill style={{ backgroundColor: timeline?.background ?? '#000' }}>
      {tracks.map((track, trackIndex) =>
        (track.clips ?? []).map((clip, clipIndex) => {
          const from = Math.max(0, Math.round((Number(clip.start) || 0) * fps));
          const duration = Math.max(1, Math.min(
            durationInFrames - from,
            Math.round((Number(clip.length) || 0) * fps)
          ));
          if (duration <= 0) return null;
          return (
            <Sequence
              key={`${trackIndex}-${clipIndex}`}
              from={from}
              durationInFrames={duration}
              layout="none"
              style={{ zIndex: tracks.length - trackIndex }}
            >
              <TimelineAsset clip={clip} />
            </Sequence>
          );
        })
      )}
    </AbsoluteFill>
  );
};
