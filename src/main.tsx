import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { initSound, isMuted, unlockAudio } from "./lib/sound";
import { silence } from "./lib/speech";
import { storageEvents } from "./lib/storage";
import "@fontsource/russo-one/latin-400.css";
import "@fontsource/outfit/latin-500.css";
import "@fontsource/outfit/latin-700.css";
import "./styles/global.css";

initSound();
window.addEventListener("click", unlockAudio, { once: true, capture: true });
window.addEventListener(storageEvents.muteEvent, () => { if (isMuted()) silence(); });

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
