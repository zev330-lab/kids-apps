import { Picture } from "../art/Picture";
import { Pip } from "../art/Pip";
import { MuteButton } from "./TopBar";
import { go } from "../lib/route";
import { playSound } from "../lib/sound";

const covers = {
  story: {
    sky: "space" as const,
    ground: "moon" as const,
    items: [
      { s: "rocket" as const, x: 200, y: 168, scale: 1.15, anim: "bob" as const },
      { s: "moon" as const, x: 320, y: 70, scale: 0.7 },
      { s: "star" as const, x: 70, y: 60, scale: 0.45, anim: "twinkle" as const },
    ],
  },
  scribble: {
    sky: "day" as const,
    ground: "grass" as const,
    items: [
      { s: "blob" as const, x: 180, y: 170, scale: 1.2, anim: "bob" as const },
      { s: "crayon" as const, x: 300, y: 160, scale: 1.1, anim: "sway" as const },
      { s: "heart" as const, x: 80, y: 80, scale: 0.6 },
    ],
  },
  parker: {
    sky: "meadow" as const,
    ground: "grass" as const,
    items: [
      { s: "firefly" as const, x: 160, y: 160, scale: 1.4, anim: "bob" as const },
      { s: "flower" as const, x: 280, y: 180, scale: 0.9, anim: "sway" as const },
      { s: "book" as const, x: 70, y: 180, scale: 0.9 },
    ],
  },
};

export function Home() {
  return (
    <div className="home">
      <div className="topbar" style={{ position: "relative" }}>
        <h1>
          <span aria-hidden="true">★ </span>Playtime
        </h1>
        <MuteButton />
      </div>
      <div className="home-hero">
        <Pip size={170} />
        <div>
          <p className="kicker">Hello</p>
          <h2 className="home-title">Pick a place to play</h2>
          <p className="lede">Stories, scribbles, and practice with Parker. All of it stays on this device.</p>
        </div>
      </div>
      <div className="app-grid">
        <button
          type="button"
          className="app-card"
          onClick={() => {
            playSound("tap");
            go("story");
          }}
        >
          <Picture spec={covers.story} label="" />
          <span className="card-copy">
            <strong>Story Builder</strong>
            <em>Choose a path. Find the endings.</em>
          </span>
        </button>
        <button
          type="button"
          className="app-card"
          onClick={() => {
            playSound("tap");
            go("scribble");
          }}
        >
          <Picture spec={covers.scribble} label="" />
          <span className="card-copy">
            <strong>Scribble Friends</strong>
            <em>Draw a friend and watch them dance.</em>
          </span>
        </button>
        <button
          type="button"
          className="app-card"
          onClick={() => {
            playSound("tap");
            go("parker");
          }}
        >
          <Picture spec={covers.parker} label="" />
          <span className="card-copy">
            <strong>Parker</strong>
            <em>Read and count together. Trying is how you grow.</em>
          </span>
        </button>
      </div>
      <details className="parent-details">
        <summary>For parents</summary>
        <p>
          No accounts, no ads, and nothing is sent to a server. Names, endings, drawings, and practice stay in this
          browser. Add Playtime to the home screen to use it like an app. After the first load it works offline.
          Sound and read-aloud use this device only, and the quiet button turns both off.
        </p>
      </details>
    </div>
  );
}
