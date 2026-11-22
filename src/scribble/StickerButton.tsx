import { useRef } from "react";
import type { PlacedSticker } from "./renderFriend";
import { fitSticker, STICKER_WIDTH } from "./stickerLayout";
import { STICKER_LABELS, stickerSvg } from "./stickers";

type Gesture = {
  pointer: number;
  start: DOMPoint;
  original: PlacedSticker;
  inverse: DOMMatrix;
  moved: boolean;
};

export function StickerButton({
  sticker,
  selected,
  onSelect,
  onMove,
  checkpoint,
}: {
  sticker: PlacedSticker;
  selected: boolean;
  onSelect: () => void;
  onMove: (placed: PlacedSticker) => void;
  checkpoint: () => void;
}) {
  const drag = useRef<Gesture | null>(null);
  return (
    <button
      type="button"
      className={selected ? "placed on" : "placed"}
      style={{
        width: `${STICKER_WIDTH * sticker.scale * 100}%`,
        left: `${sticker.x * 100}%`,
        top: `${sticker.y * 100}%`,
        transform: `translate(-50%, -50%) rotate(${sticker.rot}deg)`,
      }}
      aria-label={`Placed ${STICKER_LABELS[sticker.kind]}`}
      aria-pressed={selected}
      onClick={onSelect}
      onPointerDown={(event) => {
        if (!event.isPrimary) return;
        const layer = event.currentTarget.parentElement!;
        layer.style.animationPlayState = "paused";
        const transform = getComputedStyle(layer).transform;
        drag.current = {
          pointer: event.pointerId,
          start: new DOMPoint(event.clientX, event.clientY),
          original: sticker,
          moved: false,
          inverse: new DOMMatrix(transform === "none" ? undefined : transform).inverse(),
        };
        event.currentTarget.setPointerCapture(event.pointerId);
        onSelect();
      }}
      onPointerMove={(event) => {
        const gesture = drag.current;
        if (gesture?.pointer !== event.pointerId) return;
        const layer = event.currentTarget.parentElement!;
        // w=0 transforms the movement vector without adding the dancer's translation.
        const delta = new DOMPoint(
          event.clientX - gesture.start.x,
          event.clientY - gesture.start.y,
          0,
          0,
        ).matrixTransform(gesture.inverse);
        if (!gesture.moved && Math.hypot(delta.x, delta.y) < 2) return;
        if (!gesture.moved) checkpoint();
        gesture.moved = true;
        onMove(
          fitSticker({
            ...gesture.original,
            x: gesture.original.x + delta.x / layer.clientWidth,
            y: gesture.original.y + delta.y / layer.clientHeight,
          }),
        );
      }}
      onLostPointerCapture={(event) => {
        event.currentTarget.parentElement!.style.animationPlayState = "";
        drag.current = null;
      }}
      dangerouslySetInnerHTML={{ __html: stickerSvg(sticker.kind) }}
    />
  );
}
