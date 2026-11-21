import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { initSound, unlockAudio } from "./lib/sound";
import "@fontsource/fredoka/latin-600.css";
import "@fontsource/fredoka/latin-700.css";
import "@fontsource/nunito/latin-600.css";
import "@fontsource/nunito/latin-700.css";
import "@fontsource/nunito/latin-800.css";
import "./styles/global.css";

initSound();
window.addEventListener("pointerdown", () => unlockAudio(), { once: true });

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
