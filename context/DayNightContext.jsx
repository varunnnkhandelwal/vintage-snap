"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const Ctx = createContext(null);
const KEY = "vsnap.mode"; // 'day' | 'night' | null (auto when null)

function autoMode(now = new Date()){
  const h = now.getHours();
  return (h >= 19 || h < 7) ? "night" : "day"; // 7pm–7am = night
}

export function DayNightProvider({ children }){
  const [override, setOverride] = useState(null); // null = auto
  const [auto, setAuto] = useState(autoMode());

  useEffect(() => {
    try{
      const saved = localStorage.getItem(KEY);
      if (saved === "day" || saved === "night") setOverride(saved);
    }catch{}
  }, []);

  // schedule switch at next 7am/7pm boundary
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const next = new Date(now);
    if (hour >= 19 || hour < 7){
      if (hour >= 19) next.setDate(now.getDate() + 1);
      next.setHours(7, 0, 0, 0);
    } else {
      next.setHours(19, 0, 0, 0);
    }
    const ms = Math.max(60_000, next - now);
    const t = setTimeout(() => setAuto(autoMode()), ms);
    return () => clearTimeout(t);
  }, [auto]);

  const mode = override ?? auto;

  const value = useMemo(() => ({
    mode,
    isNight: mode === "night",
    toggle(){
      const next = mode === "night" ? "day" : "night";
      setOverride(next);
      try{ localStorage.setItem(KEY, next); }catch{}
    },
    setAuto(){
      setOverride(null);
      try{ localStorage.removeItem(KEY); }catch{}
      setAuto(autoMode());
    }
  }), [mode]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDayNight(){
  const v = useContext(Ctx);
  if (!v) throw new Error("useDayNight must be used within DayNightProvider");
  return v;
}


