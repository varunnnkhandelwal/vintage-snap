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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', zIndex: 501 }}
    >
      <motion.div
        style={{ filter: 'brightness(0) contrast(1.6) grayscale(1)' }}
        animate={{ filter: 'brightness(1) contrast(1) grayscale(0)' }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        {/* No layoutId here to avoid duplication with pile cards */}
        <PolaroidFrame src={snap.image_url} caption={snap.caption} date={snap.created_at} />
      </motion.div>
    </motion.div>
  );
}

