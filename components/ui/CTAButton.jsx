"use client";

import React from "react";
import "../../styles/cta.css";

export default function CTAButton({ children, className = "", ...props }) {
  return (
    <button type="button" className={`cta-button ${className}`} {...props}>
      <div className="cta-surface">
        <span className="cta-label">{children}</span>
      </div>
    </button>
  );
}


