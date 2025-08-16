"use client";

import { motion, AnimatePresence } from "framer-motion";
import usePrefersReducedMotion from "../lib/usePrefersReducedMotion.js";

export default function FlashOverlay({ show, onDone }){
  const reduce = usePrefersReducedMotion();
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="flash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.05 : 0.2 }}
          onAnimationComplete={() => onDone && onDone()}
          style={{ position:'fixed', inset:0, background:'#fff', pointerEvents:'none', zIndex:50 }}
          aria-hidden
        />
      ) : null}
    </AnimatePresence>
  );
}

