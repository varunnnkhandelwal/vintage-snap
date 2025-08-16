"use client";

import { useEffect, useRef } from "react";
import usePrefersReducedMotion from "../lib/usePrefersReducedMotion.js";

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
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const imgRef = useRef(null);
  const offsetRef = useRef(0);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
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

    const images = (layers && layers.length ? layers : [{ src: imageSrc, speed, scale, opacity }]).map(l => {
      const im = new Image();
      im.src = l.src;
      return { ...l, im };
    });

    function drawLayer(layer, t){
      const { im, speed: spd = speed, opacity: opa = opacity, scale: scl = scale } = layer;
      if (!im.complete) return;
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
    onVis();

    return () => {
      running = false;
      document.removeEventListener('visibilitychange', onVis);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [imageSrc, axis, speed, scale, opacity, reduce, layers]);

  return <canvas ref={canvasRef} className={`spriteCanvas ${className}`} style={{ zIndex }} aria-hidden />
}

