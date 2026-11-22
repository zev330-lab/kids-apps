import { useEffect, useState } from "react";
import { UpdatePrompt } from "./components/UpdatePrompt";
import { Home } from "./components/Home";
import { parseHash, type RouteName } from "./lib/route";
import { silence } from "./lib/speech";
import { ParkerApp } from "./parker/ParkerApp";
import { ScribbleApp } from "./scribble/ScribbleApp";
import { StoryApp } from "./story/StoryApp";

function useRoute(): RouteName {
  const [route, setRoute] = useState<RouteName>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export function App() {
  const route = useRoute();
  useEffect(() => {
    silence();
    window.scrollTo(0, 0);
  }, [route]);

  return (
    <div className={`app-shell theme-${route}`}>
      <a className="skip" href="#main">
        Skip to play
      </a>
      <UpdatePrompt />
      <main id="main">
        {route === "home" && <Home />}
        {route === "story" && <StoryApp />}
        {route === "scribble" && <ScribbleApp />}
        {route === "parker" && <ParkerApp />}
      </main>
    </div>
  );
}
