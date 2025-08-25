"use client";

import { useMemo } from "react";
import PolaroidCard from "../PolaroidCard.jsx";
import { useSnaps } from "../../context/SnapsContext.jsx";
import { DraggableCardContainer, DraggableCardBody } from "../ui/draggable-card.jsx";

export default function PolaroidPile({ snaps }){
  const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
  // Use the array order from context so moveToFront persists
  const ordered = useMemo(() => snaps.slice(), [snaps]);
  const { moveToFront } = useSnaps();

  if (isMobile){
    return (
      <div className="pileList">
        {ordered.map((snap) => (
          <div key={snap.id} onClick={() => moveToFront(snap.id)}>
            <PolaroidCard snap={snap} />
          </div>
        ))}
      </div>
    );
  }

  // z-index map that persists per session within the container
  const zMapRef = React.useRef({});
  const zTopRef = React.useRef(1000);
  const bringToFront = (id) => {
    zTopRef.current += 1;
    zMapRef.current[id] = zTopRef.current;
  };

  return (
    <div className="pileContainer" style={{ position:'relative' }}>
      {ordered.map((snap, index) => {
        const baseZ = ordered.length - index;
        const zIndex = zMapRef.current[snap.id] ?? baseZ;
        return (
          <DraggableCardBody
            key={snap.id}
            id={snap.id}
            onCardClick={() => bringToFront(snap.id)}
            onBringToFront={bringToFront}
            zIndex={zIndex}
            stackIndex={index}
          >
            <PolaroidCard snap={snap} />
          </DraggableCardBody>
        );
      })}
    </div>
  );
}

