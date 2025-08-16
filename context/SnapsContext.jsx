"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const SnapsContext = createContext({ snaps: [], addSnap: () => {} });

export function SnapsProvider({ children }) {
  const [snaps, setSnaps] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("vintage-snaps");
      if (stored) setSnaps(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("vintage-snaps", JSON.stringify(snaps));
    } catch {}
  }, [snaps]);

  const addSnap = useCallback((snap) => {
    setSnaps((prev) => [snap, ...prev]);
  }, []);

  const value = useMemo(() => ({ snaps, addSnap }), [snaps, addSnap]);

  return <SnapsContext.Provider value={value}>{children}</SnapsContext.Provider>;
}

export function useSnaps(){
  return useContext(SnapsContext);
}

