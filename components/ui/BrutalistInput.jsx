"use client";

import "../../styles/brutalist-input.css";

export default function BrutalistInput({
  id,
  label = "Caption",
  placeholder = "Caption...",
  value,
  onChange,
  className = "",
  inputProps = {},
}) {
  return (
    <div className={`brutalist-container ${className}`}>
      <input
        id={id}
        className="brutalist-input smooth-type"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...inputProps}
      />
      <label htmlFor={id} className="brutalist-label">{label}</label>
    </div>
  );
}


