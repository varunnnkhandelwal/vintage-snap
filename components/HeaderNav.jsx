"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDayNight } from "../context/DayNightContext.jsx";
import CTAButton from "./ui/CTAButton.jsx";

export default function HeaderNav(){
  const pathname = usePathname();
  const onTray = pathname?.startsWith("/tray");
  const { isNight, toggle } = useDayNight();
  return (
    <header className="vsHeader" role="banner">
      <div className="macDots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <nav aria-label="Primary" style={{ display:'flex', alignItems:'center', gap:12 }}>
        {onTray ? (
          <Link className="cta-button" href="/" id="homeNavBtn"><div className="cta-surface"><span className="cta-label">Click again!</span></div></Link>
        ) : (
          <Link id="trayNavBtn" className="cta-button" href="/tray"><div className="cta-surface"><span className="cta-label">Development room</span></div></Link>
        )}
        <CTAButton
          id="modeToggle"
          aria-label="Toggle day/night"
          title={isNight ? "Switch to day" : "Switch to night"}
          onClick={toggle}
          className="cta-icon-only"
        >
          <img className="cta-icon" src={isNight ? "/icons/moon.svg" : "/icons/sun.svg"} alt="" aria-hidden width={20} height={20} />
        </CTAButton>
      </nav>
    </header>
  );
}

