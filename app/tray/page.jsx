"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSnaps } from "../../context/SnapsContext.jsx";
import PolaroidPile from "../../components/tray/PolaroidPile.jsx";
import DevelopingPolaroid from "../../components/tray/DevelopingPolaroid.jsx";

function TrayInner(){
  const { snaps } = useSnaps();
  const search = useSearchParams();
  const router = useRouter();
  const newId = search.get('new');
  const newest = newId ? snaps.find(s => s.id === newId) : null;

  useEffect(() => {
    if (!newId) return;
    const t = setTimeout(() => router.replace('/tray'), 1600);
    return () => clearTimeout(t);
  }, [newId, router]);

  return (
    <main className="pageContent" aria-labelledby="trayTitle">
      <h1 id="trayTitle" className="sr-only">Development Room</h1>
      {newId && newest ? (
        <DevelopingPolaroid snap={newest} onDone={() => {}} />
      ) : null}
      <div className="tray-stage">
        <PolaroidPile snaps={snaps} />
      </div>
      {/* CTA handled in the header nav dynamically */}
    </main>
  );
}

export default function TrayPage(){
  return (
    <Suspense fallback={<main className="pageContent" aria-busy="true" />}>
      <TrayInner />
    </Suspense>
  );
}

