// xmur3 hash + mulberry32 RNG utilities for deterministic scatter

function xmur3(str){
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function(){
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a){
  return function(){
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

export function rngFrom(id){
  const seed = xmur3(String(id))();
  return mulberry32(seed);
}

export function randBetween(rng, min, max){
  return min + (max - min) * rng();
}

export function randNormal(rng, mean = 0, std = 1, clamp){
  // Box–Muller transform
  let u = 0, v = 0;
  while(u === 0) u = rng();
  while(v === 0) v = rng();
  let val = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  val = mean + val * std;
  if (Array.isArray(clamp)){
    const [lo, hi] = clamp;
    if (val < lo) val = lo; if (val > hi) val = hi;
  }
  return val;
}

