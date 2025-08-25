"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Shows a centered polaroid with a quick "developing" reveal,
 * then calls onDone to let the parent insert into the tray.
 */
export default function PolaroidDevelop({ snap, onDone, duration = 1200 }){
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), duration);
    return () => clearTimeout(t);
  }, [onDone, duration]);

  const dateStr = snap?.created_at?.slice(0, 10) ?? "";

  return (
    <AnimatePresence>
      <motion.div
        key="dev-overlay"
        className="fixed inset-0 z-[400] grid place-items-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.98, opacity: 0.85, rotate: -2 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          style={{ width: "min(82vw, 560px)" }}
          className="pointer-events-auto polaroid-frame relative"
        >
          <div className="p-4">
            <div className="relative overflow-hidden rounded-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={snap.image_url}
                alt={snap.caption || "Polaroid"}
                className="w-full h-auto block select-none"
                draggable={false}
                crossOrigin="anonymous"
              />
              {/* develop fog */}
              <motion.div
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 0 }}
                transition={{ duration: duration / 1000, ease: "easeOut" }}
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.6) 40%, rgba(255,255,255,0) 80%)",
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-4 pb-4">
            <div style={{ fontFamily: 'Caveat, handwriting' }} className="text-lg">{snap.caption || ""}</div>
            <div className="opacity-60 text-sm">{dateStr}</div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


