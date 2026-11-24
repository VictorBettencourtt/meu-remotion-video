import React from "react";
import { AbsoluteFill, Audio, Loop, OffthreadVideo, staticFile } from "remotion";

const src = (value: string) => value.startsWith("http") ? value : staticFile(value);

export const Achadinhos: React.FC<{
  videoUrl: string;
  narrationUrl: string;
  title: string;
  videoFrames?: number;
}> = ({videoUrl, narrationUrl, title, videoFrames = 450}) => (
  <AbsoluteFill style={{backgroundColor: "#181818", fontFamily: "Arial, sans-serif"}}>
    <Loop durationInFrames={Math.max(1, videoFrames)}>
      <OffthreadVideo src={src(videoUrl)} muted style={{width: "100%", height: "100%", objectFit: "contain"}} />
    </Loop>
    <div style={{position: "absolute", top: 110, left: 55, right: 55, textAlign: "center"}}>
      <span style={{display: "inline-block", backgroundColor: "#f4511e", color: "white", borderRadius: 20, padding: "18px 28px", fontSize: 48, fontWeight: 800, lineHeight: 1.15, textShadow: "0 2px 3px #64200b"}}>
        {title}
      </span>
    </div>
    <div style={{position: "absolute", bottom: 145, left: 55, right: 55, textAlign: "center"}}>
      <span style={{display: "inline-block", backgroundColor: "#fff", color: "#b73815", borderRadius: 20, padding: "16px 28px", fontSize: 42, fontWeight: 800}}>
        Confira o link na bio
      </span>
    </div>
    <Audio src={src(narrationUrl)} />
  </AbsoluteFill>
);
