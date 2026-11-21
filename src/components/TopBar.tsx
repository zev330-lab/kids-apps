import type { ReactNode } from "react";
import { go, type RouteName } from "../lib/route";
import { isMuted, setMuted } from "../lib/sound";
import { storageEvents } from "../lib/storage";
import { useSync } from "./useSync";

export function MuteButton() {
  const muted = useSync(isMuted, storageEvents.muteEvent);
  return (
    <button
      type="button"
      className="icon-btn"
      aria-pressed={muted}
      aria-label={muted ? "Sound is off. Turn sound on." : "Sound is on. Turn sound off."}
      onClick={() => setMuted(!muted)}
    >
      {muted ? "Quiet" : "Sound"}
    </button>
  );
}

export function TopBar({
  title,
  home = true,
  children,
}: {
  title: string;
  home?: boolean;
  children?: ReactNode;
}) {
  return (
    <header className="topbar">
      {home ? (
        <button type="button" className="icon-btn" onClick={() => go("home" as RouteName)}>
          Home
        </button>
      ) : (
        <span className="brand-mark" aria-hidden="true">
          ★
        </span>
      )}
      <h1>{title}</h1>
      {children}
      <MuteButton />
    </header>
  );
}
