"use client";

import { useEffect, useRef, useState } from "react";
import usePrefersReducedMotion from "../lib/usePrefersReducedMotion.js";
import { useDayNight } from "../context/DayNightContext.jsx";

export default function SpriteBackground({
  imageSrc,
  axis = "x",
  speed = 20,
  scale = 1,
  opacity = 1,
  zIndex = 0,
  className = "",
  layers,
}){
  const { mode } = useDayNight();
  const chosenSrc = mode === 'night' ? '/bg/night.png' : '/bg/day.png';
  const canvasRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const rafRef = useRef(0);
  const imgRef = useRef(null);
  const offsetRef = useRef(0);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    setMounted(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    let running = true;

    function resize(){
      const { clientWidth:w, clientHeight:h } = canvas;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const images = (layers && layers.length ? layers : [{ src: chosenSrc, speed, scale, opacity }]).map(l => {
      const im = new Image();
      im.src = l.src;
      return { ...l, im };
    });

    function drawLayer(layer, t){
      const { im, speed: spd = speed, opacity: opa = opacity, scale: scl = scale } = layer;
      if (!im.complete || !im.naturalWidth || !im.naturalHeight) return;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const iw = im.naturalWidth * scl, ih = im.naturalHeight * scl;
      const delta = (t * spd) % (axis === 'x' ? iw : ih);
      ctx.globalAlpha = opa;
      if (axis === 'x'){
        let x = -delta;
        while (x < w) { ctx.drawImage(im, x, 0, iw, ih); x += iw; }
      } else {
        let y = -delta;
        while (y < h) { ctx.drawImage(im, 0, y, iw, ih); y += ih; }
      }
      ctx.globalAlpha = 1;
    }

    function loop(now){
      if (!running) return;
      const t = offsetRef.current + now/1000;
      ctx.clearRect(0,0,canvas.clientWidth, canvas.clientHeight);
      for (const layer of images) drawLayer(layer, t);
      rafRef.current = requestAnimationFrame(loop);
    }

    function onVis(){
      const vis = document.visibilityState !== 'hidden' && !reduce;
      if (vis && !rafRef.current){ rafRef.current = requestAnimationFrame(loop); }
      if (!vis && rafRef.current){ cancelAnimationFrame(rafRef.current); rafRef.current = 0; }
    }
    document.addEventListener('visibilitychange', onVis);
    rafRef.current = 0; // ensure a new RAF can start
    onVis();

    return () => {
      running = false;
      document.removeEventListener('visibilitychange', onVis);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      ro.disconnect();
    };
  }, [chosenSrc, axis, speed, scale, opacity, reduce, layers]);

  return (
    <canvas
      ref={canvasRef}
      className={`spriteCanvas ${className}`}
      style={mounted ? { zIndex, backgroundImage: `url(${chosenSrc})`, backgroundRepeat: axis === 'x' ? 'repeat-x' : 'repeat-y', backgroundSize: 'auto', imageRendering: 'pixelated' } : undefined}
      suppressHydrationWarning
      aria-hidden
    />
  )
}

