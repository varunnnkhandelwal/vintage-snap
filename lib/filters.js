// Pixel operations for filters: sepia, bw, grain, none

function clampByte(v){ return v < 0 ? 0 : v > 255 ? 255 : v|0 }

export function applyFilterToImageData(imageData, type = 'none'){
  const { data, width, height } = imageData;
  if (type === 'none') return imageData;

  if (type === 'bw'){
    for (let i=0; i<data.length; i+=4){
      const r=data[i], g=data[i+1], b=data[i+2];
      const y = 0.2126*r + 0.7152*g + 0.0722*b;
      data[i]=data[i+1]=data[i+2]=clampByte(y);
    }
    return imageData;
  }

  if (type === 'sepia'){
    for (let i=0; i<data.length; i+=4){
      const r=data[i], g=data[i+1], b=data[i+2];
      const nr = clampByte(0.393*r + 0.769*g + 0.189*b);
      const ng = clampByte(0.349*r + 0.686*g + 0.168*b);
      const nb = clampByte(0.272*r + 0.534*g + 0.131*b);
      data[i]=nr; data[i+1]=ng; data[i+2]=nb;
    }
    return imageData;
  }

  if (type === 'grain'){
    // light BW + noise overlay
    const rng = mulberry32((Date.now() & 0xffff) ^ (width*height));
    for (let i=0; i<data.length; i+=4){
      const r=data[i], g=data[i+1], b=data[i+2];
      const y = 0.2126*r + 0.7152*g + 0.0722*b;
      const n = (rng()-0.5)*40; // +-20
      const v = clampByte(y + n);
      data[i]=data[i+1]=data[i+2]=v;
    }
    return imageData;
  }

  return imageData;
}

// tiny RNG for grain
function mulberry32(a){
  return function(){
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

