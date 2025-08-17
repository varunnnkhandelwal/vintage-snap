"use client";

import { motion } from "framer-motion";

export default function PolaroidFrame({ src, caption, date, variant='withText', className='', style, layoutId, onClick, children }){
  const hasCaption = caption && String(caption).trim().length > 0;
  const displayDate = new Date(date || Date.now()).toLocaleDateString();
  return (
    <motion.figure layoutId={layoutId} className={`polaroid ${className}`} style={style} onClick={onClick} role="group" aria-label="polaroid">
      <div className="polaroid-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={hasCaption ? caption : `Snapshot taken on ${displayDate}`} crossOrigin="anonymous" />
      </div>
      <figcaption className="meta">
        {hasCaption ? <span className="caption">{caption}</span> : null}
        <span className="date" aria-label="date">{displayDate}</span>
      </figcaption>
      {children}
    </motion.figure>
  );
}

