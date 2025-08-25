"use client";

import { useMemo, useState } from "react";
import PolaroidCard from "../PolaroidCard.jsx";
import { DraggableCardContainer, DraggableCardBody } from "../ui/draggable-card.jsx";

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
      <DraggableCardContainer>
        {ordered.map((snap, index) => (
          <DraggableCardBody key={snap.id}>
            <PolaroidCard snap={snap} />
          </DraggableCardBody>
        ))}
      </DraggableCardContainer>
    </div>
  );
}

