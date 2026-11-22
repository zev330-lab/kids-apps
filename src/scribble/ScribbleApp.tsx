import { FRIEND_NAMES } from "../lib/names";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { speak } from "../lib/speech";
import { StickerButton } from "./StickerButton";
import { fitSticker, openSpot } from "./stickerLayout";
import { NOTES } from "./notes";
import { TopBar } from "../components/TopBar";
import { playSound } from "../lib/sound";
import { paintBackground, BACKGROUNDS, type BackgroundId } from "./backgrounds";
import { addFriend, deleteFriend, listFriends, type FriendRecord } from "./gallery";
import {
  ERASER,
  LOGICAL_H,
  LOGICAL_W,
  drawStrokes,
  hasInk,
  type Point,
  type Stroke,
} from "./geometry";
import {
  downloadBlob,
  friendBlob,
  friendGif,
  friendMovie,
  measureDrawing,
  shareOrSave,
  type DanceName,
  type FriendState,
  type PlacedSticker,
} from "./renderFriend";
import { STICKER_KINDS, STICKER_LABELS, stickerSvg, type StickerKind } from "./stickers";

const COLORS = [
  { id: "navy", value: "#243056", label: "Navy" },
  { id: "red", value: "#e23d4a", label: "Red" },
  { id: "orange", value: "#f77f00", label: "Orange" },
  { id: "yellow", value: "#ffb703", label: "Yellow" },
  { id: "green", value: "#2a9d8f", label: "Green" },
  { id: "blue", value: "#1d6fd8", label: "Blue" },
  { id: "purple", value: "#7b2cbf", label: "Purple" },
  { id: "pink", value: "#ff6ba9", label: "Pink" },
  { id: "brown", value: "#8d5a3b", label: "Brown" },
];

const BRUSHES = [
  { id: "small", size: 10, label: "Small" },
  { id: "medium", size: 18, label: "Medium" },
  { id: "big", size: 32, label: "Big" },
  { id: "jumbo", size: 52, label: "Jumbo" },
];

type Fit = { scale: number; x: number; y: number; dpr: number; cssW: number; cssH: number };

export function ScribbleApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<Fit>({ scale: 1, x: 0, y: 0, dpr: 1, cssW: 1, cssH: 1 });
  const strokesRef = useRef<Stroke[]>([]);
  const drawing = useRef<Stroke | null>(null);
  const history = useRef<{ strokes: Stroke[]; stickers: PlacedSticker[]; background: BackgroundId; alive: boolean }[]>([]);
  const backdrop = useRef<HTMLCanvasElement>(null);

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState(COLORS[4].value);
  const [size, setSize] = useState(BRUSHES[1].size);
  const [eraser, setEraser] = useState(false);
  const [alive, setAlive] = useState(false);
  const [dance, setDance] = useState<DanceName>("wiggle");
  const [background, setBackground] = useState<BackgroundId>("meadow");
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [friendName, setFriendName] = useState("Friend");
  const [note, setNote] = useState(NOTES.start);
  const [confirmClear, setConfirmClear] = useState(false);
  const [burst, setBurst] = useState(false);
  const [busy, setBusy] = useState("");
  const [gallery, setGallery] = useState(false);
  const [friends, setFriends] = useState<FriendRecord[]>([]);
  const measured = useMemo(() => alive ? measureDrawing(strokes) : null, [alive, strokes]);
  const preview = useMemo(() => {
    if (!alive) return "";
    const canvas = document.createElement("canvas");
    canvas.width = LOGICAL_W;
    canvas.height = LOGICAL_H;
    const ctx = canvas.getContext("2d");
    if (ctx) drawStrokes(ctx, strokes);
    return canvas.toDataURL();
  }, [alive, strokes]);

  useEffect(() => {
    const ctx = backdrop.current?.getContext("2d");
    if (ctx) paintBackground(ctx, background, LOGICAL_W, LOGICAL_H);
  }, [background, gallery]);

  useEffect(() => { window.scrollTo(0, 0); }, [gallery]);
  useEffect(() => {
    if (alive && !gallery) stageRef.current?.scrollIntoView({ block: "nearest" });
  }, [alive, gallery]);

  function checkpoint() {
    history.current.push({ strokes: strokesRef.current, stickers, background, alive });
    if (history.current.length > 80) history.current.shift();
  }

  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      const scale = Math.min(rect.width / LOGICAL_W, rect.height / LOGICAL_H);
      fitRef.current = {
        scale,
        x: (rect.width - LOGICAL_W * scale) / 2,
        y: (rect.height - LOGICAL_H * scale) / 2,
        dpr,
        cssW: rect.width,
        cssH: rect.height,
      };
      paint();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [alive, gallery]);

  function paint(next = strokesRef.current) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const fit = fitRef.current;
    if (!canvas || !ctx) return;
    ctx.setTransform(fit.dpr, 0, 0, fit.dpr, 0, 0);
    ctx.clearRect(0, 0, fit.cssW, fit.cssH);
    ctx.setTransform(fit.dpr * fit.scale, 0, 0, fit.dpr * fit.scale, fit.dpr * fit.x, fit.dpr * fit.y);
    drawStrokes(ctx, next);
  }

  function toLogical(event: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    const fit = fitRef.current;
    return {
      x: (event.clientX - rect.left - fit.x) / fit.scale,
      y: (event.clientY - rect.top - fit.y) / fit.scale,
    };
  }

  function pointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!event.isPrimary) return;
    checkpoint();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = toLogical(event);
    const stroke: Stroke = { color: eraser ? ERASER : color, size, points: [point] };
    drawing.current = stroke;
    const next = [...strokesRef.current, stroke];
    strokesRef.current = next;
    setStrokes(next);
    paint(next);
  }

  function pointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!event.isPrimary || !drawing.current) return;
    const batch = event.nativeEvent.getCoalescedEvents?.();
    const events = batch?.length ? batch : [event.nativeEvent];
    for (const item of events) {
      const rect = event.currentTarget.getBoundingClientRect();
      const fit = fitRef.current;
      drawing.current.points.push({
        x: (item.clientX - rect.left - fit.x) / fit.scale,
        y: (item.clientY - rect.top - fit.y) / fit.scale,
      });
    }
    paint(strokesRef.current);
  }

  function pointerUp(event: React.PointerEvent) {
    if (event.isPrimary) drawing.current = null;
  }

  function undo() {
    const previous = history.current.pop();
    if (!previous) return;
    strokesRef.current = previous.strokes;
    setStrokes(previous.strokes);
    setBackground(previous.background);
    setStickers(previous.stickers);
    setSelected(null);
    setAlive(previous.alive);
    paint(previous.strokes);
    setNote(NOTES.undo);
    playSound("tap");
  }

  function clearAll() {
    checkpoint();
    setSelected(null);
    setBackground("meadow");
    strokesRef.current = [];
    setStrokes([]);
    setStickers([]);
    setAlive(false);
    setConfirmClear(false);
    paint([]);
    setNote(NOTES.clear);
  }

  function bringToLife() {
    if (!hasInk(strokesRef.current)) {
      setNote(NOTES.needsInk);
      playSound("again");
      return;
    }
    const result = measureDrawing(strokesRef.current);
    if (!result) {
      setNote(NOTES.erased);
      return;
    }
    setAlive(true);
    setDance("wiggle");
    setBurst(true);
    setNote(NOTES.alive);
    playSound("sparkle");
    window.setTimeout(() => setBurst(false), 1400);
  }

  function addSticker(kind: StickerKind) {
    if (stickers.length >= 8) {
      setNote(NOTES.full);
      return;
    }
    checkpoint();
    const placed: PlacedSticker = {
      id: crypto.randomUUID(),
      kind,
      ...openSpot(stickers),
      scale: 1,
      rot: 0,
    };
    setStickers((list) => [...list, placed]);
    setSelected(placed.id);
    playSound("tap");
  }

  function transformSticker(scale: number, angle: number) {
    checkpoint();
    setStickers(list => list.map(s => s.id === selected
      ? fitSticker({ ...s, scale: Math.max(0.65, Math.min(2, s.scale + scale)), rot: (s.rot + angle) % 360 }, stageRef.current?.clientWidth)
      : s));
  }

  function stateNow(): FriendState | null {
    const result = measureDrawing(strokes);
    if (!result) return null;
    return { strokes, background, stickers, dance, box: result.box, layout: result.layout };
  }

  async function keepInGallery(blob: Blob, savedNote: string, unavailableNote: string) {
    try {
      await addFriend({ id: crypto.randomUUID(), name: friendName || "Friend", created: Date.now(), blob });
      setNote(savedNote);
    } catch {
      setNote(unavailableNote);
    }
  }

  async function savePng() {
    const state = stateNow();
    if (!state) return;
    setBusy("Saving your picture…");
    try {
      const blob = await friendBlob(state, "image/png");
      downloadBlob(blob, `${fileBase()}.png`);
      await keepInGallery(blob, NOTES.saved, NOTES.downloadOnly);
      playSound("yes");
    } catch {
      setNote(NOTES.saveError);
    } finally {
      setBusy("");
    }
  }

  async function sharePng() {
    const state = stateNow();
    if (!state) return;
    setBusy("Getting ready to share…");
    try {
      const blob = await friendBlob(state, "image/png");
      const how = await shareOrSave(blob, `${fileBase()}.png`, friendName || "My scribble friend");
      if (how === "shared") await keepInGallery(blob, NOTES.shared, NOTES.shareOnly);
      else await keepInGallery(blob, NOTES.downloaded, NOTES.downloadOnly);
    } catch {
      setNote(NOTES.shareClosed);
    } finally {
      setBusy("");
    }
  }

  async function saveMovie() {
    const state = stateNow();
    if (!state) return;
    setBusy("Making a short movie…");
    try {
      const movie = await friendMovie(state);
      if (movie && movie.size > 0) {
        const ext = movie.type.includes("mp4") ? "mp4" : "webm";
        downloadBlob(movie, `${fileBase()}.${ext}`);
        setNote(NOTES.movie);
      } else {
        const gif = await friendGif(state);
        downloadBlob(gif, `${fileBase()}.gif`);
        setNote(NOTES.gif);
      }
      playSound("yes");
    } catch {
      setNote(NOTES.movieError);
      playSound("again");
    } finally {
      setBusy("");
    }
  }

  function fileBase() {
    const safe = (friendName || "friend").toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
    return `scribble-${safe || "friend"}`;
  }

  async function openGallery() {
    try {
      setFriends(await listFriends());
      setGallery(true);
    } catch {
      setNote(NOTES.galleryUnavailable);
    }
  }

  if (gallery) {
    return (
      <div className="screen scribble-app">
        <TopBar title="Gallery">
          <button type="button" className="icon-btn" onClick={() => setGallery(false)}>
            Back
          </button>
        </TopBar>
        <div className="screen-body gallery-body">
          {friends.length === 0 && <p className="lede">Your friends will wait here after you save one.</p>}
          <div className="gallery-grid">
            {friends.map((friend) => (
              <GalleryCard
                key={friend.id}
                friend={friend}
                onDelete={async () => {
                  await deleteFriend(friend.id);
                  setFriends(await listFriends());
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen scribble-app">
      <TopBar title="Scribble Friends">
        <button type="button" className="icon-btn" onClick={() => void openGallery()}>
          Gallery
        </button>
      </TopBar>
      <div className="scribble-body">
        <div className="tool-dock" aria-label="Drawing tools">
          <div className="color-row">
            {COLORS.map((swatch) => (
              <button
                key={swatch.id}
                type="button"
                className={!eraser && color === swatch.value ? "swatch on" : "swatch"}
                style={{ background: swatch.value }}
                aria-label={swatch.label}
                aria-pressed={!eraser && color === swatch.value}
                onClick={() => {
                  setAlive(false);
                  setColor(swatch.value);
                  setEraser(false);
                }}
              />
            ))}
          </div>
          <div className="utility-row">
            <button
              type="button"
              className={eraser ? "tool on" : "tool"}
              aria-pressed={eraser}
              onClick={() => {
                setAlive(false);
                setEraser(true);
              }}
            >
              Eraser
            </button>
            {BRUSHES.map((brush) => (
              <button
                key={brush.id}
                type="button"
                className={!eraser && size === brush.size ? "tool on" : "tool"}
                aria-pressed={!eraser && size === brush.size}
                onClick={() => {
                  setAlive(false);
                  setSize(brush.size);
                  setEraser(false);
                }}
              >
                {brush.label}
              </button>
            ))}
            <button type="button" className="tool" onClick={undo} disabled={!history.current.length}>
              Undo
            </button>
            <button
              type="button"
              className="tool"
              onClick={() => setConfirmClear(true)}
              disabled={!strokes.length && !stickers.length && background === "meadow"}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="canvas-column">
          <div className="stage-note">
            <p className="status" role="status">
              {busy || note}
            </p>
            <button type="button" className="tool" onClick={() => speak(note)} aria-label="Hear drawing note">
              Hear it
            </button>
          </div>
          <div className="stage" ref={stageRef}>
            <div className="stage-art" data-background={background}>
              <canvas className="backdrop" ref={backdrop} width={LOGICAL_W} height={LOGICAL_H} aria-hidden="true" />
              {burst && alive && <Confetti />}
              <div className={alive ? `dancer dance-${dance}` : "artwork"}>
                {alive && measured ? (
                  <>
                    <img src={preview} alt="" />
                    <svg className="limb-layer" viewBox={`0 0 ${LOGICAL_W} ${LOGICAL_H}`}>
                      <Limb
                        a={measured.layout.leftArm}
                        b={{ x: measured.layout.leftArm.x - 54, y: measured.layout.leftArm.y + 46 }}
                        w={measured.layout.limb}
                      />
                      <Limb
                        a={measured.layout.rightArm}
                        b={{ x: measured.layout.rightArm.x + 54, y: measured.layout.rightArm.y + 40 }}
                        w={measured.layout.limb}
                      />
                      <Limb
                        a={measured.layout.leftLeg}
                        b={{ x: measured.layout.leftLeg.x - 8, y: measured.layout.leftLeg.y + 78 }}
                        w={measured.layout.limb}
                      />
                      <Limb
                        a={measured.layout.rightLeg}
                        b={{ x: measured.layout.rightLeg.x + 12, y: measured.layout.rightLeg.y + 78 }}
                        w={measured.layout.limb}
                      />
                      <path
                        d={`M ${measured.layout.mouth.x - measured.layout.mouth.w / 2} ${measured.layout.mouth.y} Q ${measured.layout.mouth.x} ${measured.layout.mouth.y + measured.layout.eyeR} ${measured.layout.mouth.x + measured.layout.mouth.w / 2} ${measured.layout.mouth.y}`}
                        fill="none"
                        stroke="#243056"
                        strokeWidth={Math.max(4, measured.layout.eyeR * 0.22)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="eye" style={eyeStyle(measured.layout.leftEye, measured.layout.eyeR)}>
                      <i />
                    </span>
                    <span className="eye" style={eyeStyle(measured.layout.rightEye, measured.layout.eyeR)}>
                      <i />
                    </span>
                  </>
                ) : (
                  <canvas
                    className="ink"
                    ref={canvasRef}
                    aria-label="Drawing canvas"
                    onPointerDown={pointerDown}
                    onPointerMove={pointerMove}
                    onPointerUp={pointerUp}
                    onPointerCancel={pointerUp}
                  />
                )}
                {stickers.map((sticker) => (
                  <StickerButton
                    key={sticker.id}
                    sticker={sticker}
                    selected={selected === sticker.id}
                    onSelect={() => setSelected(sticker.id)}
                    checkpoint={checkpoint}
                    onMove={(placed) => setStickers((list) => list.map((s) => (s.id === placed.id ? placed : s)))}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="sticker-dock" aria-label="Stickers and backgrounds">
          <div className="dock-label">Backgrounds</div>
          <div className="bg-row">
            {BACKGROUNDS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={background === item.id ? `bg-swatch bg-${item.id} on` : `bg-swatch bg-${item.id}`}
                aria-pressed={background === item.id}
                onClick={() => {
                  if (item.id !== background) checkpoint();
                  setBackground(item.id);
                }}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <div className="dock-label">Stickers</div>
          <div className="sticker-row">
            {STICKER_KINDS.map((kind) => (
              <button key={kind} type="button" className="sticker-btn" onClick={() => addSticker(kind)}>
                <span dangerouslySetInnerHTML={{ __html: stickerSvg(kind) }} />
                <em>{STICKER_LABELS[kind]}</em>
              </button>
            ))}
          </div>
          {selected && (
            <div className="sticker-controls">
              <button
                type="button"
                className="tool"
                onClick={() => transformSticker(-0.2, 0)}
                disabled={(stickers.find((s) => s.id === selected)?.scale ?? 1) <= 0.65}
              >
                Smaller
              </button>
              <button
                type="button"
                className="tool"
                onClick={() => transformSticker(0.2, 0)}
                disabled={(stickers.find((s) => s.id === selected)?.scale ?? 1) >= 2}
              >
                Bigger
              </button>
              <button type="button" className="tool" onClick={() => transformSticker(0, 30)}>
                Turn
              </button>
              <button
                type="button"
                className="tool"
                onClick={() => {
                  checkpoint();
                  setStickers((list) => list.filter((item) => item.id !== selected));
                  setSelected(null);
                }}
              >
                Peel off
              </button>
            </div>
          )}
        </aside>
      </div>

      <div className="action-bar">
        {!alive ? (
          <button type="button" className="btn btn-primary big" onClick={bringToLife}>
            Bring to life
          </button>
        ) : (
          <>
            {(["wiggle", "bounce", "dance"] as DanceName[]).map((mode) => (
              <button
                key={mode}
                type="button"
                className={dance === mode ? "btn btn-mint on" : "btn btn-mint"}
                aria-pressed={dance === mode}
                onClick={() => setDance(mode)}
              >
                {mode === "wiggle" ? "Wiggle" : mode === "bounce" ? "Bounce" : "Dance"}
              </button>
            ))}
            <label className="name-field inline">
              <span>Friend's name</span>
              <input value={friendName} maxLength={16} onChange={(event) => setFriendName(event.target.value)} />
            </label>
            <div className="name-chips">
              {FRIEND_NAMES.map((name) => (
                <button key={name} type="button" className="chip" onClick={() => setFriendName(name)}>
                  {name}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-primary" onClick={() => void savePng()} disabled={!!busy}>
              Save picture
            </button>
            <button type="button" className="btn" onClick={() => void sharePng()} disabled={!!busy}>
              Share
            </button>
            <button type="button" className="btn" onClick={() => void saveMovie()} disabled={!!busy}>
              Save movie
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setAlive(false);
                setNote(NOTES.drawMore);
              }}
            >
              Draw more
            </button>
          </>
        )}
      </div>

      {confirmClear && (
        <div className="sheet-back" role="dialog" aria-modal="true" aria-labelledby="clear-title">
          <div className="sheet">
            <h2 id="clear-title">Start a fresh scribble?</h2>
            <p>Your marks will go away. You can always draw a new friend.</p>
            <div className="row-actions">
              <button type="button" className="btn btn-primary" onClick={clearAll}>
                Fresh page
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmClear(false)}>
                Keep drawing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function eyeStyle(point: Point, radius: number): CSSProperties {
  return {
    left: `${(point.x / LOGICAL_W) * 100}%`,
    top: `${(point.y / LOGICAL_H) * 100}%`,
    width: `${((radius * 2) / LOGICAL_W) * 100}%`,
  };
}

function Limb({ a, b, w }: { a: Point; b: Point; w: number }) {
  return (
    <g>
      <path
        d={`M ${a.x} ${a.y} Q ${(a.x + b.x) / 2 - 12} ${(a.y + b.y) / 2} ${b.x} ${b.y}`}
        fill="none"
        stroke="#ff7a3c"
        strokeWidth={w}
        strokeLinecap="square"
      />
      <rect x={b.x - w * 0.7} y={b.y - w * 0.7} width={w * 1.4} height={w * 1.4} rx={3} fill="#ffb020" />
    </g>
  );
}

function Confetti() {
  const bits = Array.from({ length: 28 }, (_, i) => i);
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((bit) => (
        <i key={bit} style={{ left: `${(bit * 37) % 100}%`, animationDelay: `${(bit % 8) * 0.05}s`, background: ["#ffd166", "#f25c54", "#4dabf7", "#7dce6a", "#b388ff"][bit % 5] }} />
      ))}
    </div>
  );
}

function GalleryCard({ friend, onDelete }: { friend: FriendRecord; onDelete: () => Promise<void> }) {
  const [url, setUrl] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [cardNote, setCardNote] = useState("");
  useEffect(() => {
    const next = URL.createObjectURL(friend.blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [friend]);
  return (
    <article className="gallery-card">
      {url && <img src={url} alt="" />}
      <h3>{friend.name}</h3>
      {cardNote && <p role="status">{cardNote}</p>}
      <div className="row-actions">
        <button
          type="button"
          className="btn"
          onClick={() => downloadBlob(friend.blob, `${friend.name || "friend"}.png`)}
        >
          Save
        </button>
        <button
          type="button"
          className="btn"
          onClick={async () => {
            try {
              const how = await shareOrSave(friend.blob, `${friend.name || "friend"}.png`, friend.name);
              setCardNote(how === "shared" ? NOTES.shared : NOTES.downloaded);
            } catch {
              setCardNote(NOTES.shareClosed);
            }
          }}
        >
          Share
        </button>
        {!confirm ? (
          <button type="button" className="btn btn-ghost" onClick={() => setConfirm(true)}>
            Let go
          </button>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={() => onDelete().catch(() => {
            setConfirm(false);
            setCardNote("The gallery needs a moment. Try again soon.");
          })}>
            Yes, let go
          </button>
        )}
      </div>
    </article>
  );
}
