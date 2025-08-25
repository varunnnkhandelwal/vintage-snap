"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const SnapsContext = createContext(null);

export function SnapsProvider({ children }) {
  // In-memory only — lost on full reload
  const [snaps, setSnaps] = useState([]);
  const [pending, setPending] = useState(null);

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
      addSnap: (snap) => setSnaps((s) => (s.find((x) => x.id === snap.id) ? s : [snap, ...s])),
      removeSnap: (id) => setSnaps((s) => s.filter((x) => x.id !== id)),
      moveToFront: (id) => setSnaps((s) => {
        const idx = s.findIndex((x) => x.id === id);
        if (idx <= 0) return s; // already first or not found
        const copy = s.slice();
        const [item] = copy.splice(idx, 1);
        copy.unshift(item);
        return copy;
      }),
      clearSnaps: () => setSnaps([]),
      pending,
      setPending,
    }),
    [snaps, pending]
  );

  return <SnapsContext.Provider value={api}>{children}</SnapsContext.Provider>;
}

export function useSnaps() {
  const ctx = useContext(SnapsContext);
  if (!ctx) throw new Error("useSnaps must be used within <SnapsProvider>");
  return ctx;
}

