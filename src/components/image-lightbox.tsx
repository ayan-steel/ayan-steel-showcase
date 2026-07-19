import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export function ImageLightbox({ src, alt, onClose }: { src: string | null; alt?: string; onClose: () => void }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);

  useEffect(() => {
    if (!src) return;
    setScale(1);
    setPos({ x: 0, y: 0 });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(s + 0.25, 5));
      if (e.key === "-") setScale((s) => Math.max(s - 0.25, 1));
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [src, onClose]);

  if (!src) return null;

  const clampScale = (s: number) => Math.max(1, Math.min(5, s));

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const next = clampScale(scale + (e.deltaY > 0 ? -0.2 : 0.2));
    setScale(next);
    if (next === 1) setPos({ x: 0, y: 0 });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (scale === 1) return;
    dragRef.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    setPos({ x: dragRef.current.px + (e.clientX - dragRef.current.x), y: dragRef.current.py + (e.clientY - dragRef.current.y) });
  };
  const endDrag = () => { dragRef.current = null; };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      pinchRef.current = { dist, scale };
    } else if (e.touches.length === 1 && scale > 1) {
      const t = e.touches[0];
      dragRef.current = { x: t.clientX, y: t.clientY, px: pos.x, py: pos.y };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const next = clampScale(pinchRef.current.scale * (dist / pinchRef.current.dist));
      setScale(next);
      if (next === 1) setPos({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && dragRef.current) {
      const t = e.touches[0];
      setPos({ x: dragRef.current.px + (t.clientX - dragRef.current.x), y: dragRef.current.py + (t.clientY - dragRef.current.y) });
    }
  };
  const onTouchEnd = () => { pinchRef.current = null; dragRef.current = null; };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className="fixed inset-0 z-[70] grid place-items-center bg-foreground/95 backdrop-blur-sm p-4"
      >
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-background text-foreground hover:scale-105 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 flex gap-2 rounded-full bg-background/95 p-1.5 shadow-lg">
          <button onClick={(e) => { e.stopPropagation(); setScale((s) => clampScale(s - 0.25)); }} aria-label="Zoom out" className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary"><ZoomOut className="h-4 w-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); setScale(1); setPos({ x: 0, y: 0 }); }} aria-label="Reset" className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary"><RotateCcw className="h-4 w-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); setScale((s) => clampScale(s + 0.25)); }} aria-label="Zoom in" className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary"><ZoomIn className="h-4 w-4" /></button>
        </div>

        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="max-h-[90vh] max-w-[92vw] overflow-hidden select-none"
          style={{ cursor: scale > 1 ? (dragRef.current ? "grabbing" : "grab") : "zoom-in" }}
        >
          <img
            src={src}
            alt={alt ?? ""}
            draggable={false}
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
              transformOrigin: "center center",
              transition: dragRef.current || pinchRef.current ? "none" : "transform 0.2s ease-out",
            }}
            className="max-h-[90vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl pointer-events-none"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
