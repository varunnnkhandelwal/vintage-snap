"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSnaps } from "../context/SnapsContext.jsx";
import { applyFilterToImageData } from "../lib/filters.js";
import { saveSnap } from "../lib/api/mockAPI.js";
import FlashOverlay from "./FlashOverlay.jsx";

export default function VintageCamera(){
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [caption, setCaption] = useState("");
  const [filter, setFilter] = useState("none");
  const [ready, setReady] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const screenRef = useRef(null);
  const router = useRouter();
  const { addSnap } = useSnaps();

  useEffect(() => {
    let stream;
    async function init(){
      try{
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio:false });
        const video = videoRef.current;
        if (video){
          video.srcObject = stream;
          const onLoaded = async () => {
            try { await video.play(); } catch (err) { /* AbortError or NotAllowedError */ }
            setReady(true);
          };
          video.addEventListener('loadedmetadata', onLoaded, { once:true });
        }
      }catch(e){
        console.error("getUserMedia error", e);
      }
    }
    init();
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, []);

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
  }, [caption, filter, ready]);

  async function onCapture(){
    const video = videoRef.current; const canvas = canvasRef.current; const screenEl = screenRef.current;
    if (!video || !canvas) return;
    const vw = video.videoWidth; const vh = video.videoHeight;
    const targetAspect = 644 / 358;
    const videoAspect = vw / vh;
    // Crop source to match the camera screen aspect (cover)
    let sx = 0, sy = 0, sw = vw, sh = vh;
    if (videoAspect > targetAspect){
      // video wider than target → crop width
      sh = vh;
      sw = Math.round(vh * targetAspect);
      sx = Math.round((vw - sw) / 2);
      sy = 0;
    } else {
      // video taller than target → crop height
      sw = vw;
      sh = Math.round(vw / targetAspect);
      sx = 0;
      sy = Math.round((vh - sh) / 2);
    }
    canvas.width = sw; canvas.height = sh;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
    const imgData = ctx.getImageData(0,0,sw,sh);
    applyFilterToImageData(imgData, filter);
    ctx.putImageData(imgData,0,0);
    const blob = await new Promise((res)=> canvas.toBlob(res, 'image/jpeg', 0.9));
    if (!blob) return;
    setFlashing(true);
    const saved = await saveSnap({ blob, caption, tags:[], filter });
    addSnap(saved);
    setTimeout(() => {
      setFlashing(false);
      router.push(`/tray?new=${saved.id}`);
    }, 180);
  }

  return (
    <div>
      <div className="camWrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="camShell" src="/ui/camera-shell.png" alt="Camera shell" />
        <div className="camScreen" ref={screenRef}>
          <video ref={videoRef} playsInline muted aria-label="Live camera feed" style={{ width:'100%', height:'100%', objectFit:'cover', aspectRatio:'644 / 358' }} />
        </div>
        <div className="camFilmSlot" aria-hidden="true" />
      </div>
      <div className="controlsRow" role="group" aria-label="Camera controls">
        <label className="brutalist-container">
          <span className="sr-only">Caption</span>
          <input className="brutalist-input smooth-type" aria-label="Caption" value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption..." />
          <span className="brutalist-label" aria-hidden>Caption</span>
        </label>
        <label>
          <span className="sr-only">Filter</span>
          <select className="select" aria-label="Filter" value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="none">None</option>
            <option value="sepia">Sepia</option>
            <option value="bw">BW</option>
            <option value="grain">Grain</option>
          </select>
        </label>
        <button id="captureBtn" className="bigBtn" onClick={onCapture} disabled={!ready} aria-keyshortcuts="Space">
          Capture!
        </button>
      </div>
      <canvas ref={canvasRef} style={{ display:'none' }} />
      <FlashOverlay show={flashing} />
    </div>
  );
}

