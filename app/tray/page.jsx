"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSnaps } from "../../context/SnapsContext.jsx";
import PolaroidPile from "../../components/tray/PolaroidPile.jsx";

function TrayInner(){
  const { snaps } = useSnaps();
  const router = useRouter();

  return (
    <main className="pageContent" aria-labelledby="trayTitle">
      <h1 id="trayTitle" className="sr-only">Development Room</h1>
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

