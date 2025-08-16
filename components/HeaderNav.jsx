"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HeaderNav(){
  const pathname = usePathname();
  const onTray = pathname?.startsWith("/tray");
  return (
    <header className="vsHeader" role="banner">
      <div className="macDots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <nav aria-label="Primary">
        {onTray ? (
          <Link className="bigBtn" href="/" id="homeNavBtn">Click again!</Link>
        ) : (
          <Link id="trayNavBtn" className="bigBtn" href="/tray">Development room</Link>
        )}
      </nav>
    </header>
  );
}

