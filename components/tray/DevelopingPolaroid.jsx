"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import PolaroidFrame from "../PolaroidFrame.jsx";

export default function DevelopingPolaroid({ snap, onDone }){
  useEffect(() => {
    const t = setTimeout(() => onDone && onDone(), 1500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:.3, ease:"easeOut" }} style={{ position:'fixed', inset:'auto 0 0 0', display:'flex', justifyContent:'center', pointerEvents:'none', zIndex:30 }}>
      <motion.div style={{ filter:'brightness(0) contrast(1.6) grayscale(1)' }} animate={{ filter:'brightness(1) contrast(1) grayscale(0)' }} transition={{ duration:1.4, ease:"easeOut" }}>
        <PolaroidFrame layoutId={`snap-${snap.id}`} src={snap.image_url} caption={snap.caption} date={snap.created_at} />
      </motion.div>
    </motion.div>
  );
}

