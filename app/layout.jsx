import "../styles/globals.css";
import "../styles/polaroid.css";
import "../styles/sprite-bg.css";
import "../styles/cta.css";
import { SnapsProvider } from "../context/SnapsContext.jsx";
import { DayNightProvider } from "../context/DayNightContext.jsx";
import HeaderNav from "../components/HeaderNav.jsx";
import SpriteBackground from "../components/SpriteBackground.jsx";

export const metadata = {
  title: "Vintage Snap",
  description: "A playful retro camera that develops your shots into polaroids.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/fonts/hand.css" />
        <style>{`.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}`}</style>
        <link rel="preload" as="image" href="/bg/day.png" />
        <link rel="preload" as="image" href="/bg/night.png" />
      </head>
      <body>
        <DayNightProvider>
          <SnapsProvider>
            <HeaderNav />
            <SpriteBackground imageSrc="/bg/clouds.png" axis="x" speed={25} />
            {children}
          </SnapsProvider>
        </DayNightProvider>
      </body>
    </html>
  );
}
