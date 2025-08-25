"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function DevelopingOverlay({ snap, open, onDone, duration = 1300 }) {
  React.useEffect(() => {
    if (!open || !snap) return;
    const t = setTimeout(() => onDone?.(snap), duration);
    return () => clearTimeout(t);
  }, [open, snap, duration, onDone]);

  return (
    <AnimatePresence>
      {open && snap && (
        <>
          <motion.div
            className="fixed inset-0 z-[500] bg-black/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed inset-0 z-[501] grid place-items-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.96, filter: "grayscale(1) contrast(0.85) brightness(1.15) blur(1px)" }}
            animate={{ opacity: 1, scale: 1, filter: "grayscale(0) contrast(1) brightness(1) blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.35 }}
          >
            <div className="pointer-events-auto polaroid develop-shadow">
              <div className="polaroid-frame bg-white">
                <div className="p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={snap.image_url}
                    alt={snap.caption || "Polaroid"}
                    className="w-[min(76vw,560px)] h-auto rounded-sm object-contain select-none"
                    crossOrigin="anonymous"
                    draggable={false}
                  />
                </div>
                <div className="flex items-center justify-between px-4 pb-4">
                  <div className="font-handwriting text-lg">{snap.caption || ""}</div>
                  <div className="opacity-60 text-sm tabular-nums">{(snap.created_at || "").slice(0,10)}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


