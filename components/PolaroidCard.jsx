"use client";

import { useRef, useCallback } from "react";
import { exportNodeAsPng } from "@/lib/exportPolaroid";
import PolaroidFrame from "./PolaroidFrame.jsx";

export default function PolaroidCard({ snap, className = "", onDoubleClick, ...rest }){
  const exportRef = useRef(null);

  const handleDownload = useCallback(async (e) => {
    e.stopPropagation();
    const dateStr = (snap.created_at || "").slice(0, 10);
    await exportNodeAsPng(exportRef.current, `polaroid-${dateStr || snap.id}.png`, [
      ".polaroid-dl",
    ]);
  }, [snap]);

  return (
    <div className={`polaroid-card ${className}`} onDoubleClick={onDoubleClick} {...rest}>
      <div ref={exportRef} className="polaroid-export">
        <PolaroidFrame layoutId={`snap-${snap.id}`} src={snap.image_url} caption={snap.caption} date={snap.created_at} />
      </div>
      <button type="button" className="polaroid-dl" onClick={handleDownload} aria-label="Download polaroid">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3a1 1 0 0 1 1 1v8.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4A1 1 0 0 1 8.707 10.293L11 12.586V4a1 1 0 0 1 1-1zM5 19a1 1 0 1 0 0 2h14a1 1 0 1 0 0-2H5z"/>
        </svg>
      </button>
    </div>
  );
}


