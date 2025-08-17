"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// repeatable "random"
const seeded = (n)=>{ let x = Math.sin(n*9999)*10000; return x - Math.floor(x); };

function useScatter(i){
  return {
    rx: (seeded(i+1)*60 - 30),           // -30..30 px
    ry: (seeded(i+2)*40 - 20),           // -20..20 px
    rot: (seeded(i+3)*12 - 6),           // -6..6  deg
    scale: 1 - Math.min(i*0.015, 0.08),  // depth
    z: 1000 - i,                         // stack order
  };
}

export function DraggableCardContainer({ className, children }){
  const ref = useRef(null);
  const kids = React.Children.map(children, (c,i)=>
    React.isValidElement(c) ? React.cloneElement(c, { containerRef: ref, stackIndex: i }) : c
  );
  return <div ref={ref} className={cn("polaroid-drag-container", className)}>{kids}</div>;
}

export function DraggableCardBody({
  className,
  children,
  containerRef,
  stackIndex = 0,
  onCardClick,
}){
  const { rx, ry, rot, scale, z } = useScatter(stackIndex);
  const [zLift, setZLift] = useState(0);

  return (
    <motion.div
      drag
      dragConstraints={containerRef}
      dragElastic={0.25}
      dragMomentum
      dragTransition={{ power: 0.3, timeConstant: 220 }}
      onDragStart={()=>setZLift(10)}
      onDragEnd={()=>setTimeout(()=>setZLift(0),120)}
      onClick={()=>onCardClick?.(stackIndex)}
      className={cn("polaroid-card", className)}
      style={{
        /* Center the anchor of this card inside the container */
        position: "absolute",
        left: "50%",
        top: "50%",
        translate: "-50% -50%",  // keeps anchor centered even while dragging
        zIndex: z + zLift,
        willChange: "transform",
        cursor: "grab",
      }}
      whileHover={{ scale: scale * 1.02 }}
      whileTap={{ scale: scale * 0.985 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      {/* Apply scatter/rotation/scale to the inner wrapper so centering is preserved */}
      <div
        className="polaroid-card-inner"
        style={{
          transform: `translate(${rx}px, ${-Math.max(0, stackIndex*6)+ry}px) rotate(${rot}deg) scale(${scale})`,
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}


