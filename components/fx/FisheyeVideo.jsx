"use client";

/**
 * FisheyeVideo.jsx – WebGL fisheye preview with Three.js and shader warp.
 * Exposes exportAsBlob() to capture the CURRENT distorted frame.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import usePrefersReducedMotion from "../../lib/usePrefersReducedMotion.js";

let THREE; // lazy import to avoid SSR issues

export default function FisheyeVideo({
  className = "",
  style,
  k = [-0.28, 0.05, 0.0, 0.0],
  principal = [0.5, 0.5],
  vignette = 0.25,
  chromAb = 0.003,
  model = "polynomial",
  fov = 120,
  // --- new look controls ---
  chromStrength = 0.0075,
  chromPow = 1.6,
  chromTangential = 0.003,
  edgeBlur = 0.35,
  grainAmount = 0.035,
  vignettePower = 1.8,
  // orientation controls
  mirrorX = true,
  flipY = true,
  onGetApi,
}){
  const prefersReduced = usePrefersReducedMotion();
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const videoTextureRef = useRef(null);
  const materialRef = useRef(null);
  const rafRef = useRef(0);
  const streamRef = useRef(null);
  const mountedRef = useRef(false);
  const [webglOk, setWebglOk] = useState(true);
  const kRef = useRef(k);
  const vignetteRef = useRef(vignette);
  const chromAbRef = useRef(chromAb);
  const principalRef = useRef(principal);

  const vert = useMemo(() => `
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
  `, []);

  const frag = useMemo(() => `
precision highp float;

uniform sampler2D uTexture;
uniform vec2  uResolution;
uniform float uAspect;
uniform vec2  uPrincipal;
uniform vec4  uK;
uniform float uVignette;
uniform float uVignettePower;

uniform float uChromStrength;
uniform float uChromPow;
uniform float uChromTangential;
uniform float uEdgeBlur;
uniform float uGrainAmount;

uniform float uChromAb;   // legacy input, unused directly
uniform float uFlipY;
uniform float uMirrorX;
uniform float uTime;

varying vec2 vUv;

float hash(vec2 p){
  p = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3)));
  return fract(sin(p.x+p.y*1.61803)*43758.5453);
}

vec3 sampleChrom(vec2 uv, vec2 dir, float r) {
  float rr = pow(r, uChromPow);
  float m  = uChromStrength * rr;
  vec2 tdir = vec2(-dir.y, dir.x);
  vec2 offR =  dir * m * 1.00 + tdir * uChromTangential * rr;
  vec2 offG =  vec2(0.0);
  vec2 offB = -dir * m * 1.40 - tdir * uChromTangential * rr * 0.7;
  float rC = texture2D(uTexture, uv + offR).r;
  float gC = texture2D(uTexture, uv + offG).g;
  float bC = texture2D(uTexture, uv + offB).b;
  return vec3(rC,gC,bC);
}

void main() {
  vec2 uv = vUv;
  if (uFlipY > 0.5)   uv.y = 1.0 - uv.y;
  if (uMirrorX > 0.5) uv.x = 1.0 - uv.x;
  vec2 p = (uv - uPrincipal) * vec2(uAspect, 1.0);
  float r2 = dot(p,p);
  float r  = sqrt(r2);
  float r4 = r2*r2, r6 = r4*r2, r8 = r4*r4;
  float d  = 1.0 + uK.x*r2 + uK.y*r4 + uK.z*r6 + uK.w*r8;
  vec2 pd = p * d;
  vec2 suv = pd / vec2(uAspect, 1.0) + uPrincipal;
  float inX = step(0.0, suv.x) * step(suv.x, 1.0);
  float inY = step(0.0, suv.y) * step(suv.y, 1.0);
  float inside = inX * inY;
  vec2 dir = (r > 1e-6) ? normalize(p) : vec2(1.0, 0.0);
  vec3 base = sampleChrom(suv, dir, r);
  float edge = smoothstep(0.65, 1.05, r);
  float blurAmt = uEdgeBlur * edge;
  vec2 stepR = dir * (0.0015 + 0.0025 * edge);
  vec2 tdir  = vec2(-dir.y, dir.x);
  vec3 b1 = texture2D(uTexture, suv + stepR).rgb;
  vec3 b2 = texture2D(uTexture, suv - stepR).rgb;
  vec3 b3 = texture2D(uTexture, suv + tdir * stepR).rgb;
  vec3 b4 = texture2D(uTexture, suv - tdir * stepR).rgb;
  vec3 soft = mix(base, (base + b1 + b2 + b3 + b4) / 5.0, blurAmt);
  float vig = 1.0;
  if (uVignette > 0.0){
    float vr = pow(r, uVignettePower);
    float v  = smoothstep(0.95, 0.15, vr);
    vig = mix(1.0, v, uVignette);
  }
  vec3 color = soft * vig;
  if (uGrainAmount > 0.0){
    vec2 gp = suv * uResolution.xy + uTime * 60.0;
    float g = (hash(gp) - 0.5) * 2.0;
    color += g * uGrainAmount;
  }

  // --- Vintage color grade ---
  // mild overall desaturation toward luma
  float Y = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = mix(color, vec3(Y), 0.12);

  // faded blacks (lift), soft toe
  color = pow(color, vec3(0.92));
  color = mix(vec3(0.06), color, 0.94);

  // split-toning: cool shadows, warm highlights
  vec3 cool = vec3(0.92, 1.00, 1.05);
  vec3 warm = vec3(1.06, 1.00, 0.92);
  float t = smoothstep(0.35, 0.85, Y);
  color *= mix(cool, warm, t);

  // gentle channel trims
  color.r *= 1.03;
  color.g *= 0.99;
  color.b *= 0.98;

  // lightweight halation
  float maxRGB = max(max(color.r, color.g), color.b);
  float halo = smoothstep(0.75, 1.0, maxRGB) * 0.08;
  color += vec3(halo * 0.9, halo * 0.35, halo * 0.25);

  color = clamp(color, 0.0, 1.0) * inside;
  gl_FragColor = vec4(color, 1.0);
}
  `, []);

  const stopEverything = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const r = rendererRef.current; if (r){ r.dispose?.(); rendererRef.current = null; }
    const s = streamRef.current; if (s) s.getTracks().forEach(t=>t.stop());
  }, []);

  const resize = useCallback(() => {
    const cnv = canvasRef.current; const r = rendererRef.current; const mat = materialRef.current; if (!cnv || !r || !mat) return;
    const rect = cnv.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio||1, 2);
    r.setPixelRatio(dpr); r.setSize(rect.width, rect.height, false);
    const aspect = rect.width/rect.height; mat.uniforms.uResolution.value.set(rect.width, rect.height); mat.uniforms.uAspect.value = aspect;
  }, []);

  const exportAsBlob = useCallback(async ({ mime="image/jpeg", quality=0.92, maxWidth=1600 }={}) => {
    if (rendererRef.current){
      const cnv = rendererRef.current.domElement; rendererRef.current.render(sceneRef.current, cameraRef.current);
      const cssW = cnv.width / (rendererRef.current.getPixelRatio()||1); const cssH = cnv.height / (rendererRef.current.getPixelRatio()||1);
      if (maxWidth && cssW > maxWidth){ const scale = maxWidth/cssW; const off = document.createElement('canvas'); off.width = Math.round(cssW*scale); off.height = Math.round(cssH*scale); off.getContext('2d').drawImage(cnv,0,0,cssW,cssH,0,0,off.width,off.height); return new Promise(res=>off.toBlob(res, mime, quality)); }
      return new Promise(res=>cnv.toBlob(res, mime, quality));
    }
    const v = videoRef.current; if (!v || v.readyState < 2) return null; const inC = document.createElement('canvas'); inC.width=v.videoWidth; inC.height=v.videoHeight; const ctx=inC.getContext('2d'); ctx.drawImage(v,0,0); return new Promise(res=>inC.toBlob(res,mime,quality));
  }, []);

  useEffect(() => { onGetApi?.({ exportAsBlob, setK:(arr)=>{kRef.current=arr; materialRef.current?.uniforms.uK.value.set(arr[0],arr[1],arr[2],arr[3]);}, setVignette:(v)=>{vignetteRef.current=v; if(materialRef.current) materialRef.current.uniforms.uVignette.value=v;}, stop: stopEverything, isWebGL:()=>!!rendererRef.current }); }, [exportAsBlob, onGetApi, stopEverything]);

  useEffect(() => {
    if (mountedRef.current) return; mountedRef.current = true; let destroyed = false;
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'user', width:{ ideal:1280 }, frameRate:{ ideal:30 } }, audio:false }).catch((e)=>{ console.warn('getUserMedia failed', e); return null; });
      if (!stream){ setWebglOk(false); return; }
      streamRef.current = stream; const v = videoRef.current || document.createElement('video'); v.playsInline=true; v.muted=true; v.autoplay=true; v.srcObject=stream; await v.play().catch((e)=>{ console.warn('video.play failed', e); });
      try{
        THREE = await import('three'); const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha:true, antialias:false, preserveDrawingBuffer:true }); rendererRef.current = renderer;
        const scene = new THREE.Scene(); sceneRef.current = scene; const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1); cameraRef.current=camera;
        const videoTexture = new THREE.VideoTexture(v); videoTextureRef.current=videoTexture; videoTexture.minFilter=THREE.LinearFilter; videoTexture.magFilter=THREE.LinearFilter; videoTexture.generateMipmaps=false; videoTexture.flipY=false; // KEEP: always false, control in shader
        const geo = new THREE.PlaneGeometry(2,2); const uniforms = { uTexture:{ value: videoTexture }, uResolution:{ value: new THREE.Vector2(1,1) }, uAspect:{ value:1 }, uPrincipal:{ value: new THREE.Vector2(principalRef.current[0], principalRef.current[1]) }, uK:{ value: new THREE.Vector4(kRef.current[0],kRef.current[1],kRef.current[2],kRef.current[3]) }, uVignette:{ value: vignetteRef.current }, uChromAb:{ value: chromAbRef.current }, uFlipY:{ value: flipY ? 1.0 : 0.0 }, uMirrorX:{ value: mirrorX ? 1.0 : 0.0 }, uVignettePower:{ value: vignettePower }, uChromStrength:{ value: chromStrength }, uChromPow:{ value: chromPow }, uChromTangential:{ value: chromTangential }, uEdgeBlur:{ value: edgeBlur }, uGrainAmount:{ value: grainAmount }, uTime:{ value: 0.0 } };
        const material = new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: frag }); materialRef.current=material; const mesh = new THREE.Mesh(geo, material); scene.add(mesh);
        resize(); const onResize = () => resize(); window.addEventListener('resize', onResize);
        // also when canvas first attaches ensure visible size is non-zero
        setTimeout(resize, 0);
        const render = () => { if (destroyed) return; if (!document.hidden) { if (v.readyState>=2) videoTexture.needsUpdate=true; if (materialRef.current) materialRef.current.uniforms.uTime.value = performance.now()*0.001; renderer.render(scene,camera); } rafRef.current = requestAnimationFrame(render); };
        rafRef.current = requestAnimationFrame(render); setWebglOk(true);
        return () => { destroyed = true; cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', onResize); renderer.dispose?.(); };
      } catch(err){ console.warn('WebGL init failed, using fallback video', err); setWebglOk(false); }
    })();
    return () => { stopEverything(); };
  }, [resize, stopEverything]);

  useEffect(() => { kRef.current = k; materialRef.current?.uniforms.uK.value.set(k[0],k[1],k[2],k[3]); }, [k]);
  useEffect(() => { vignetteRef.current = vignette; if (materialRef.current) materialRef.current.uniforms.uVignette.value = vignette; }, [vignette]);
  useEffect(() => { chromAbRef.current = chromAb; if (materialRef.current) materialRef.current.uniforms.uChromAb.value = chromAb; }, [chromAb]);
  useEffect(() => { principalRef.current = principal; materialRef.current?.uniforms.uPrincipal.value.set(principal[0],principal[1]); }, [principal]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uFlipY.value = flipY ? 1.0 : 0.0; }, [flipY]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uMirrorX.value = mirrorX ? 1.0 : 0.0; }, [mirrorX]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uVignettePower.value = vignettePower; }, [vignettePower]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uChromStrength.value = chromStrength; }, [chromStrength]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uChromPow.value = chromPow; }, [chromPow]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uChromTangential.value = chromTangential; }, [chromTangential]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uEdgeBlur.value = edgeBlur; }, [edgeBlur]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uGrainAmount.value = grainAmount; }, [grainAmount]);

  return (
    <div ref={wrapRef} className={className} style={{ position:'relative', width:'100%', height:'100%', ...style }}>
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', display: webglOk ? 'block':'none' }} aria-hidden="true" />
      <video ref={videoRef} autoPlay playsInline muted style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display: webglOk ? 'none':'block' }} />
    </div>
  );
}

