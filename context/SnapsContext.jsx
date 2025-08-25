"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const SnapsContext = createContext(null);

export function SnapsProvider({ children }) {
  // In-memory only — lost on full reload
  const [snaps, setSnaps] = useState([]);

  // Optional: wipe any legacy persisted data once
  useEffect(() => {
    try {
      localStorage.removeItem("snaps");
      localStorage.removeItem("vintageSnaps");
      localStorage.removeItem("vintage-snaps");
    } catch {}
  }, []);

  const api = useMemo(
    () => ({
      snaps,
      addSnap: (snap) => setSnaps((s) => [snap, ...s]),
      removeSnap: (id) => setSnaps((s) => s.filter((x) => x.id !== id)),
      clearSnaps: () => setSnaps([]),
    }),
    [snaps]
  );

  return <SnapsContext.Provider value={api}>{children}</SnapsContext.Provider>;
}

export function useSnaps() {
  const ctx = useContext(SnapsContext);
  if (!ctx) throw new Error("useSnaps must be used within <SnapsProvider>");
  return ctx;
}

