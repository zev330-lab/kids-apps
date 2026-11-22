import { useEffect, useState } from "react";
import { Picture, SpriteBadge } from "../art/Picture";
import { TopBar } from "../components/TopBar";
import { useSync } from "../components/useSync";
import { playSound } from "../lib/sound";
import { canSpeak, localVoice, silence, speak } from "../lib/speech";
import { RECORDED_NAMES } from "../lib/names";
import { loadEndings, loadHero, rememberEnding, sanitizeName, saveHero, storageEvents } from "../lib/storage";
import { fillName, sceneSpeech, type Scene, type World } from "./model";
import { WORLDS, worldById } from "./worlds";

export function StoryApp() {
  const [draftName, setDraftName] = useState<string | null>(null);
  const [worldId, setWorldId] = useState<string | null>(null);
  const [sceneId, setSceneId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [book, setBook] = useState(false);
  const [freshId, setFreshId] = useState<string | null>(null);
  const hero = useSync(loadHero, storageEvents.heroEvent);
  const endings = useSync(loadEndings, storageEvents.endingEvent);
  const world = worldId ? worldById(worldId) : undefined;
  const scene = world ? world.scenes[sceneId ?? world.start] : undefined;

  useEffect(() => {
    if (!world || !scene?.ending) {
      setFreshId(null);
      return;
    }
    const already = (loadEndings()[world.id] ?? []).includes(scene.ending.id);
    rememberEnding(world.id, scene.ending.id);
    setFreshId(already ? null : scene.ending.id);
    if (!already) playSound("grow");
  }, [world, scene]);

  useEffect(() => () => silence(), [sceneId, book]);

  if (book) {
    return (
      <StickerBook
        focus={worldId}
        endings={endings}
        onClose={() => setBook(false)}
      />
    );
  }

  if (!world || !scene) {
    return (
      <div className="screen story-app">
        <TopBar title="Story Builder" />
        <div className="screen-body">
          <p className="lede">Choose a world. Every path is kind, and the endings wait in your sticker book.</p>
          <label className="name-field">
            <span>The hero's name</span>
            <input
              value={draftName ?? hero}
              maxLength={16}
              autoCapitalize="words"
              autoComplete="off"
              onChange={(event) => {
                setDraftName(event.target.value);
                saveHero(event.target.value);
              }}
              onBlur={(event) => {
                saveHero(sanitizeName(event.target.value));
                setDraftName(null);
              }}
            />
          </label>
          <div className="world-grid">
            {WORLDS.map((item) => {
              const found = endings[item.id]?.length ?? 0;
              const total = Object.values(item.scenes).filter((entry) => entry.ending).length;
              return (
                <button
                  key={item.id}
                  type="button"
                  className="world-card"
                  onClick={() => {
                    playSound("tap");
                    setWorldId(item.id);
                    setSceneId(item.start);
                    setHistory([]);
                  }}
                >
                  <Picture spec={item.scenes[item.start].picture} label="" />
                  <span className="card-copy">
                    <strong>{item.title}</strong>
                    <em>{item.blurb}</em>
                    <small>
                      {found} of {total} endings found
                    </small>
                  </span>
                </button>
              );
            })}
          </div>
          <button type="button" className="btn btn-ghost wide" onClick={() => setBook(true)}>
            Open the sticker book
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen story-app">
      <TopBar title={world.title}>
        <button type="button" className="icon-btn" onClick={() => setBook(true)}>
          Stickers
        </button>
      </TopBar>
      <div className="screen-body story-stage">
        <div className="story-art">
          <Picture spec={scene.picture} label={scene.title} />
        </div>
        <div className="story-copy">
          <p className="kicker">{scene.ending ? "An ending" : world.title}</p>
          <h2>{fillName(scene.title, hero)}</h2>
          <p>{fillName(scene.text, hero)}</p>
          {scene.ending && <p className="ending-note">{fillName(scene.ending.note, hero)}</p>}
          {scene.ending && freshId === scene.ending.id && <p className="ending-note">A new sticker is in your book.</p>}
          <div className="choice-stack">
            {scene.choices?.map((choice) => (
              <button
                key={choice.to + choice.label}
                type="button"
                className="choice"
                onClick={() => {
                  playSound("tap");
                  setHistory((stack) => [...stack, scene.id]);
                  setSceneId(choice.to);
                }}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <div className="row-actions">
            {canSpeak() && (
              <button
                type="button"
                className="btn btn-mint"
                onClick={() => {
                  const recorded = RECORDED_NAMES.find((name) => name.toLowerCase() === hero.toLowerCase());
                  const spokenName = recorded ?? (localVoice() ? hero : "our explorer");
                  void speak(sceneSpeech(scene, spokenName), 0.92);
                }}
              >
                Read to me
              </button>
            )}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                silence();
                if (history.length === 0) {
                  setWorldId(null);
                  setSceneId(null);
                  return;
                }
                const previous = history[history.length - 1];
                setHistory((stack) => stack.slice(0, -1));
                setSceneId(previous);
              }}
            >
              {history.length === 0 ? "All worlds" : "Back"}
            </button>
            {scene.ending && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setHistory([]);
                  setSceneId(world.start);
                }}
              >
                Read this world again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StickerBook({
  focus,
  endings,
  onClose,
}: {
  focus: string | null;
  endings: Record<string, string[]>;
  onClose: () => void;
}) {
  const [tab, setTab] = useState(focus ?? WORLDS[0].id);
  const world = worldById(tab) as World;
  const found = new Set(endings[world.id] ?? []);
  const stickers = Object.values(world.scenes).filter((entry): entry is Scene & { ending: NonNullable<Scene["ending"]> } =>
    Boolean(entry.ending),
  );

  return (
    <div className="screen story-app">
      <TopBar title="Sticker book">
        <button type="button" className="icon-btn" onClick={onClose}>
          Close
        </button>
      </TopBar>
      <div className="screen-body">
        <p className="lede">Endings you have found. The quiet ones are still out in the story, waiting kindly.</p>
        <div className="tab-row" role="tablist">
          {WORLDS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={tab === item.id ? "tab on" : "tab"}
              onClick={() => setTab(item.id)}
            >
              {item.title}
            </button>
          ))}
        </div>
        <div className="sticker-grid">
          {stickers.map((entry) => {
            const got = found.has(entry.ending.id);
            return (
              <article key={entry.ending.id} className={got ? "sticker found" : "sticker waiting"}>
                {got ? (
                  <SpriteBadge name={entry.ending.sticker} label={entry.ending.title} />
                ) : (
                  <div className="mystery" aria-hidden="true">
                    ?
                  </div>
                )}
                <h3>{got ? entry.ending.title : "Still to find"}</h3>
                <p>{got ? fillName(entry.ending.note, loadHero()) : "A path in this world leads here."}</p>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
