"use client";

// Owner: Arshawn. The processing beam (his ask 2026-11-15: "this border beam around the border of the phone" while a plate photo
// is read). A rainbow glow rides the edge of the app frame, rounded like a phone's display corners. It is the one place the app
// uses more than its blues, because it signals AI is working (docs/DESIGN.md, effects.registry processing-beam).
//
// Built cheap for iPhone Safari instead of using the border-beam package (that one runs a 30 fps requestAnimationFrame loop and
// animates conic gradients and blur filters, so every frame repaints a screen-sized layer):
//   - the colors are drawn ONCE into a small canvas (256 x 256), so its texture is tiny however large it is shown;
//   - the canvas only rotates (a CSS transform animation, run by the compositor; no per-frame JS, no repaint);
//   - a static mask (an SVG drawn once per size) cuts it to a thin ring plus a soft inner glow; no animated blur anywhere;
//   - it fades in and out on opacity, and is removed from the page when processing ends.
// Reduced motion: the same glow, still.
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import css from "./ProcessingBeam.module.css";

const SIZE = 256;

// OKLCH -> sRGB bytes (Bjorn Ottosson's matrices), clamped into gamut.
function oklchToRgb(L: number, C: number, hDeg: number): [number, number, number] {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return lin.map((v) => {
    const c = Math.min(1, Math.max(0, v));
    return Math.round(255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055));
  }) as [number, number, number];
}

// One full rainbow around the ring (even lightness, so no hue looks brighter than another), with two brighter beams opposite each
// other, so both long edges of a tall phone always carry one.
function paint(cv: HTMLCanvasElement) {
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const img = ctx.createImageData(SIZE, SIZE);
  const lut = Array.from({ length: 360 }, (_, h) => oklchToRgb(0.7, 0.2, h));
  const c = SIZE / 2;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const deg = ((Math.atan2(y + 0.5 - c, x + 0.5 - c) * 180) / Math.PI + 360) % 360;
      const fromBeam = Math.min(deg % 180, 180 - (deg % 180)); // 0 at a beam's head, 90 halfway between the two
      const lift = Math.max(0, Math.cos((Math.min(fromBeam, 70) / 70) * (Math.PI / 2))) ** 2;
      const [r, g, b] = lut[Math.floor(deg)];
      const i = (y * SIZE + x) * 4;
      img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b;
      img.data[i + 3] = Math.round(255 * (0.32 + 0.68 * lift));
    }
  }
  ctx.putImageData(img, 0, 0);
}

export function ProcessingBeam() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => { if (ref.current) paint(ref.current); }, []);
  return (
    <motion.div
      className={css.beam}
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <canvas ref={ref} width={SIZE} height={SIZE} className={css.spin} />
    </motion.div>
  );
}
