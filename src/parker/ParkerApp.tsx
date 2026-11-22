import { lines } from "./lines";
import { useState } from "react";
import { Pip } from "../art/Pip";
import { TopBar } from "../components/TopBar";
import { useSync } from "../components/useSync";
import { silence, speak } from "../lib/speech";
import { loadGrowth, storageEvents } from "../lib/storage";
import {
  AddActivity,
  BookActivity,
  BuildActivity,
  CountActivity,
  FeelingActivity,
  LetterActivity,
  ShapeActivity,
  SightActivity,
} from "./Activities";
import { ACTIVITIES, type ActivityId } from "./content";
import { Garden } from "./Garden";

export function ParkerApp() {
  const [activity, setActivity] = useState<ActivityId | null>(null);
  const growth = useSync(loadGrowth, storageEvents.growthEvent);

  function open(id: ActivityId) {
    const meta = ACTIVITIES.find((item) => item.id === id);
    setActivity(id);
    if (meta) speak(lines.intro(meta.title, meta.intro), 0.84);
  }

  function rest() {
    silence();
    setActivity(null);
  }

  return (
    <div className="screen parker-app">
      <TopBar title="Parker">
        <span className="pill">
          {growth.tries} {growth.tries === 1 ? "try" : "tries"}
        </span>
      </TopBar>
      <div className="screen-body">
        {activity === null && (
          <div className="parker-home">
            <div className="parker-intro">
              <Pip mood="happy" size={180} />
              <div>
                <p className="kicker">Hi, Parker</p>
                <h2>We practice side by side.</h2>
                <p className="lede">Short games for reading and numbers. Trying matters most.</p>
              </div>
              <Garden />
              <aside className="grownup">
                <p className="kicker">For Zev</p>
                <p>
                  Sit with Parker. Read the green notes if you want. Nothing is timed, and we do not keep
                  points. If a try does not land yet, the app says let's try again. A wiggly tummy or a warm face
                  can be what learning feels like, and that is okay.
                </p>
              </aside>
            </div>
            <div className="act-grid">
              {ACTIVITIES.map((item) => (
                <button key={item.id} type="button" className="act-card" onClick={() => open(item.id)}>
                  <strong>{item.title}</strong>
                  <em>{item.blurb}</em>
                </button>
              ))}
            </div>
          </div>
        )}
        {activity === "letters" && <LetterActivity onRest={rest} />}
        {activity === "sights" && <SightActivity onRest={rest} />}
        {activity === "build" && <BuildActivity onRest={rest} />}
        {activity === "book" && <BookActivity onRest={rest} />}
        {activity === "count" && <CountActivity onRest={rest} />}
        {activity === "add" && <AddActivity onRest={rest} />}
        {activity === "shapes" && <ShapeActivity onRest={rest} />}
        {activity === "feeling" && <FeelingActivity onRest={rest} />}
      </div>
    </div>
  );
}
