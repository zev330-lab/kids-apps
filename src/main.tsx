import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { initSound, unlockAudio } from "./lib/sound";
import "@fontsource/russo-one/latin-400.css";
import "@fontsource/outfit/latin-500.css";
import "@fontsource/outfit/latin-700.css";
import "./styles/global.css";

initSound();
window.addEventListener("pointerdown", () => unlockAudio(), { once: true });

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
