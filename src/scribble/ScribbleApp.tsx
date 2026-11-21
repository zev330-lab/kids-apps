import { useEffect, useRef, useState, type CSSProperties } from "react";
import { TopBar } from "../components/TopBar";
import { playSound } from "../lib/sound";
import { BACKGROUNDS, type BackgroundId } from "./backgrounds";
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

const NAMES = ["Pip", "Bo", "Sunny", "Dot", "Momo", "Nib"];

type Fit = { scale: number; x: number; y: number; dpr: number; cssW: number; cssH: number };

export function ScribbleApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<Fit>({ scale: 1, x: 0, y: 0, dpr: 1, cssW: 1, cssH: 1 });
  const strokesRef = useRef<Stroke[]>([]);
  const drawing = useRef<Stroke | null>(null);
  const drag = useRef<{ id: string; pointer: number } | null>(null);

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
  const [note, setNote] = useState("Draw with your finger. Then tap Bring to life.");
  const [confirmClear, setConfirmClear] = useState(false);
  const [burst, setBurst] = useState(false);
  const [busy, setBusy] = useState("");
  const [gallery, setGallery] = useState(false);
  const [friends, setFriends] = useState<FriendRecord[]>([]);
  const [preview, setPreview] = useState<string>("");
  const measured = alive ? measureDrawing(strokes) : null;

  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = wrap.getBoundingClientRect();
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
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [alive]);

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
    if (!drawing.current) return;
    const events = event.nativeEvent.getCoalescedEvents?.() ?? [event.nativeEvent];
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

  function pointerUp() {
    drawing.current = null;
  }

  function undo() {
    const next = strokesRef.current.slice(0, -1);
    strokesRef.current = next;
    setStrokes(next);
    paint(next);
    playSound("tap");
  }

  function clearAll() {
    strokesRef.current = [];
    setStrokes([]);
    setStickers([]);
    setAlive(false);
    setConfirmClear(false);
    paint([]);
    setNote("A fresh page. Draw anything.");
  }

  function bringToLife() {
    if (!hasInk(strokesRef.current)) {
      setNote("Draw something first. A squiggle is a great start.");
      playSound("again");
      return;
    }
    const result = measureDrawing(strokesRef.current);
    if (!result) {
      setNote("Try a darker color so your friend can show up.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = LOGICAL_W;
    canvas.height = LOGICAL_H;
    const ctx = canvas.getContext("2d");
    if (ctx) drawStrokes(ctx, strokesRef.current);
    setPreview(canvas.toDataURL("image/png"));
    setAlive(true);
    setDance("wiggle");
    setBurst(true);
    setNote("Hello! Your scribble grew eyes.");
    playSound("sparkle");
    window.setTimeout(() => setBurst(false), 1400);
  }

  function addSticker(kind: StickerKind) {
    if (stickers.length >= 8) {
      setNote("This friend is wearing a lot. Peel one off to add another.");
      return;
    }
    const spot = stickers.length;
    const placed: PlacedSticker = {
      id: crypto.randomUUID(),
      kind,
      x: 0.5 + ((spot % 5) - 2) * 0.08,
      y: 0.18 + (spot % 3) * 0.05,
      rot: (spot % 5) * 6 - 12,
    };
    setStickers((list) => [...list, placed]);
    setSelected(placed.id);
    playSound("tap");
  }

  function stateNow(): FriendState | null {
    const result = measureDrawing(strokes);
    if (!result) return null;
    return { strokes, background, stickers, dance, box: result.box, layout: result.layout };
  }

  async function savePng() {
    const state = stateNow();
    if (!state) return;
    setBusy("Saving your picture…");
    try {
      const blob = await friendBlob(state, "image/png");
      downloadBlob(blob, `${fileBase()}.png`);
      await addFriend({ id: crypto.randomUUID(), name: friendName || "Friend", created: Date.now(), blob });
      setNote("Saved on this device, and in your gallery.");
      playSound("yes");
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
      setNote(how === "shared" ? "Shared from this device." : "Saved the picture instead.");
      await addFriend({ id: crypto.randomUUID(), name: friendName || "Friend", created: Date.now(), blob });
    } catch {
      setNote("Sharing closed. Your drawing is still here.");
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
        setNote("Movie saved. If it does not play, try the picture instead.");
      } else {
        const gif = await friendGif(state);
        downloadBlob(gif, `${fileBase()}.gif`);
        setNote("Saved a moving picture.");
      }
      playSound("yes");
    } catch {
      setNote("The movie did not finish. The picture save still works.");
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
    setFriends(await listFriends());
    setGallery(true);
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
              onClick={() => setEraser(true)}
            >
              Eraser
            </button>
            {BRUSHES.map((brush) => (
              <button
                key={brush.id}
                type="button"
                className={!eraser && size === brush.size ? "tool on" : "tool"}
                onClick={() => {
                  setSize(brush.size);
                  setEraser(false);
                }}
              >
                {brush.label}
              </button>
            ))}
            <button type="button" className="tool" onClick={undo} disabled={!strokes.length}>
              Undo
            </button>
            <button type="button" className="tool" onClick={() => setConfirmClear(true)} disabled={!strokes.length}>
              Clear
            </button>
          </div>
        </div>

        <div className="canvas-column">
          <p className="status" role="status">
            {busy || note}
          </p>
          {alive && measured ? (
            <div ref={stageRef} className={`stage bg-${background}`}>
              {burst && <Confetti />}
              <div className={`dancer dance-${dance}`}>
                <img src={preview} alt="" />
                <svg className="limb-layer" viewBox={`0 0 ${LOGICAL_W} ${LOGICAL_H}`}>
                  <Limb a={measured.layout.leftArm} b={{ x: measured.layout.leftArm.x - 54, y: measured.layout.leftArm.y + 46 }} w={measured.layout.limb} />
                  <Limb a={measured.layout.rightArm} b={{ x: measured.layout.rightArm.x + 54, y: measured.layout.rightArm.y + 40 }} w={measured.layout.limb} />
                  <Limb a={measured.layout.leftLeg} b={{ x: measured.layout.leftLeg.x - 8, y: measured.layout.leftLeg.y + 78 }} w={measured.layout.limb} />
                  <Limb a={measured.layout.rightLeg} b={{ x: measured.layout.rightLeg.x + 12, y: measured.layout.rightLeg.y + 78 }} w={measured.layout.limb} />
                  <path
                    d={`M ${measured.layout.mouth.x - measured.layout.mouth.w / 2} ${measured.layout.mouth.y} Q ${measured.layout.mouth.x} ${measured.layout.mouth.y + measured.layout.eyeR} ${measured.layout.mouth.x + measured.layout.mouth.w / 2} ${measured.layout.mouth.y}`}
                    fill="none"
                    stroke="#243056"
                    strokeWidth={Math.max(4, measured.layout.eyeR * 0.22)}
                    strokeLinecap="round"
                  />
                </svg>
                <span
                  className="eye"
                  style={eyeStyle(measured.layout.leftEye, measured.layout.eyeR)}
                >
                  <i />
                </span>
                <span
                  className="eye"
                  style={eyeStyle(measured.layout.rightEye, measured.layout.eyeR)}
                >
                  <i />
                </span>
                {stickers.map((sticker) => (
                  <button
                    key={sticker.id}
                    type="button"
                    className={selected === sticker.id ? "placed on" : "placed"}
                    style={{
                      left: `${sticker.x * 100}%`,
                      top: `${sticker.y * 100}%`,
                      transform: `translate(-50%, -50%) rotate(${sticker.rot}deg)`,
                    }}
                    aria-label={STICKER_LABELS[sticker.kind]}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      event.currentTarget.setPointerCapture(event.pointerId);
                      drag.current = { id: sticker.id, pointer: event.pointerId };
                      setSelected(sticker.id);
                    }}
                    onPointerMove={(event) => {
                      if (drag.current?.pointer !== event.pointerId || !stageRef.current) return;
                      const rect = stageRef.current.getBoundingClientRect();
                      const x = Math.max(0.08, Math.min(0.92, (event.clientX - rect.left) / rect.width));
                      const y = Math.max(0.08, Math.min(0.92, (event.clientY - rect.top) / rect.height));
                      setStickers((list) => list.map((item) => (item.id === sticker.id ? { ...item, x, y } : item)));
                    }}
                    onPointerUp={() => {
                      drag.current = null;
                    }}
                    dangerouslySetInnerHTML={{ __html: stickerSvg(sticker.kind) }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="canvas-wrap" ref={wrapRef}>
              <canvas
                ref={canvasRef}
                aria-label="Drawing canvas"
                onPointerDown={pointerDown}
                onPointerMove={pointerMove}
                onPointerUp={pointerUp}
                onPointerCancel={pointerUp}
              />
            </div>
          )}
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
                onClick={() => setBackground(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="dock-label">Stickers</div>
          <div className="sticker-row">
            {STICKER_KINDS.map((kind) => (
              <button key={kind} type="button" className="sticker-btn" onClick={() => addSticker(kind)} disabled={!alive}>
                <span dangerouslySetInnerHTML={{ __html: stickerSvg(kind) }} />
                <em>{STICKER_LABELS[kind]}</em>
              </button>
            ))}
          </div>
          {selected && (
            <button
              type="button"
              className="tool"
              onClick={() => {
                setStickers((list) => list.filter((item) => item.id !== selected));
                setSelected(null);
              }}
            >
              Peel off
            </button>
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
              {NAMES.map((name) => (
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
                setNote("Add more marks, then bring your friend back.");
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
        stroke="#ffb088"
        strokeWidth={w}
        strokeLinecap="round"
      />
      <circle cx={b.x} cy={b.y} r={w * 0.7} fill="#ffc2a8" />
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

function GalleryCard({ friend, onDelete }: { friend: FriendRecord; onDelete: () => void }) {
  const [url, setUrl] = useState("");
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    const next = URL.createObjectURL(friend.blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [friend]);
  return (
    <article className="gallery-card">
      {url && <img src={url} alt="" />}
      <h3>{friend.name}</h3>
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
          onClick={() => void shareOrSave(friend.blob, `${friend.name || "friend"}.png`, friend.name)}
        >
          Share
        </button>
        {!confirm ? (
          <button type="button" className="btn btn-ghost" onClick={() => setConfirm(true)}>
            Let go
          </button>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={onDelete}>
            Yes, let go
          </button>
        )}
      </div>
    </article>
  );
}
