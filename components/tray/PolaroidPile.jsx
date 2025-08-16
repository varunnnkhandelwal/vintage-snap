"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import PolaroidFrame from "../PolaroidFrame.jsx";
import { rngFrom, randBetween } from "../../lib/seededRandom.js";

export default function PolaroidPile({ snaps }){
  const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
  const ordered = useMemo(() => [...snaps].sort((a,b) => (new Date(b.created_at) - new Date(a.created_at))), [snaps]);
  const [zBoostId, setZBoostId] = useState(null);

  if (isMobile){
    return (
      <div className="pileList">
        {ordered.map(snap => (
          <PolaroidFrame key={snap.id} layoutId={`snap-${snap.id}`} src={snap.image_url} caption={snap.caption} date={snap.created_at} />
        ))}
      </div>
    );
  }

  return (
    <div className="pileContainer">
      {ordered.map((snap, index) => {
        const rng = rngFrom(snap.id);
        const rot = randBetween(rng, -10, 10);
        const dx = randBetween(rng, -80, 80);
        const dy = randBetween(rng, -50, 50);
        const zIndex = (ordered.length - index) + (zBoostId === snap.id ? 1000 : 0);
        return (
          <motion.div key={snap.id} style={{ position:'absolute', left:'50%', top:'50%', transform:`translate(-50%,-50%) rotate(${rot}deg) translate(${dx}px, ${dy}px)`, zIndex }} drag dragMomentum={false} dragElastic={0.2} onDragStart={() => setZBoostId(snap.id)}>
            <PolaroidFrame layoutId={`snap-${snap.id}`} src={snap.image_url} caption={snap.caption} date={snap.created_at} />
          </motion.div>
        );
      })}
    </div>
  );
}

