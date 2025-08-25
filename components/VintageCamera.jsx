"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSnaps } from "../context/SnapsContext.jsx";
import { saveSnap } from "../lib/api/mockAPI.js";
import FlashOverlay from "./FlashOverlay.jsx";
import { AnimatePresence } from "framer-motion";
import FisheyeVideo from "./fx/FisheyeVideo.jsx";
import BrutalistInput from "./ui/BrutalistInput.jsx";
import CTAButton from "./ui/CTAButton.jsx";

export default function VintageCamera(){
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [caption, setCaption] = useState("");
  const [ready, setReady] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const screenRef = useRef(null);
  const fisheyeApiRef = useRef(null);
  const capturingRef = useRef(false);
  const router = useRouter();
  const { addSnap } = useSnaps();

  // Mark ready shortly after fisheye API is provided
  useEffect(() => {
    if (fisheyeApiRef.current && !ready){
      const t = setTimeout(() => setReady(true), 500);
      return () => clearTimeout(t);
    }
  }, [fisheyeApiRef.current, ready]);

  // Spacebar to capture (ignores when typing in inputs)
  useEffect(() => {
    function onKey(e){
      if (e.code !== 'Space' || e.repeat) return;
      const ae = document.activeElement;
      const tag = (ae && ae.tagName) ? ae.tagName.toLowerCase() : '';
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select' || (ae && ae.isContentEditable);
      if (!isTyping && ready) {
        e.preventDefault();
        onCapture();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [caption, ready]);

  async function onCapture(){
    if (capturingRef.current) return;
    capturingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Prefer fisheye export if available
    if (fisheyeApiRef.current && typeof fisheyeApiRef.current.exportAsBlob === 'function'){
      const warpedBlob = await fisheyeApiRef.current.exportAsBlob({ mime:'image/jpeg', quality:0.95, maxWidth:1600 });
      if (!warpedBlob) return;
      // show temporary ghost and navigate; add to context after flight on tray
      // We'll show a temporary ghost on the tray; once there, we'll add to context
      setFlashing(true);
      const saved = await saveSnap({ blob: warpedBlob, caption, tags:[] });
      addSnap(saved);
      setTimeout(() => { setFlashing(false); router.push('/tray'); capturingRef.current = false; }, 150);
      return;
    }

    // Fallback: no fisheye API, capture from native video (if present)
    const video = videoRef.current; const screenEl = screenRef.current;
    if (!video) return;
    const vw = video.videoWidth; const vh = video.videoHeight;
    const targetAspect = 644 / 358; const videoAspect = vw / vh;
    let sx = 0, sy = 0, sw = vw, sh = vh;
    if (videoAspect > targetAspect){ sh = vh; sw = Math.round(vh * targetAspect); sx = Math.round((vw - sw) / 2); sy = 0; }
    else { sw = vw; sh = Math.round(vw / targetAspect); sx = 0; sy = Math.round((vh - sh) / 2); }
    canvas.width = sw; canvas.height = sh; const ctx = canvas.getContext('2d');
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
    const blob = await new Promise((res)=> canvas.toBlob(res, 'image/jpeg', 0.9)); if (!blob) return;
    setFlashing(true);
    const saved = await saveSnap({ blob, caption, tags:[] });
    addSnap(saved);
    setTimeout(() => { setFlashing(false); router.push('/tray'); capturingRef.current = false; }, 150);
  }

  return (
    <div>
      <div className="camWrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="camShell" src="/ui/camera-shell.png" alt="Camera shell" />
        <div className="camScreen" ref={screenRef}>
          <FisheyeVideo
            className=""
            k={[-0.28, 0.05, 0, 0]}
            vignette={0.25}
            chromAb={0.003}
            principal={[0.5, 0.5]}
            flipY={true}
            mirrorX={true}
            onGetApi={(api) => { fisheyeApiRef.current = api; setReady(true); }}
          />
        </div>
        <div className="camFilmSlot" aria-hidden="true" />
      </div>
      <div className="controlsRow" role="group" aria-label="Camera controls">
        <BrutalistInput id="caption" label="Caption" placeholder="Caption..." value={caption} onChange={(e)=>setCaption(e.target.value)} />
        {/* Filter control removed - single baked vintage look */}
        <CTAButton id="captureBtn" onClick={onCapture} disabled={!ready} aria-keyshortcuts="Space" style={{ marginTop: 12 }}>
          Capture!
        </CTAButton>
      </div>
      <canvas ref={canvasRef} style={{ display:'none' }} />
      <FlashOverlay show={flashing} />
    </div>
  );
}

