"use client";

// Owner: Arshawn. The processing beam: a blue glow that rides the edge of the plate photo while it is read (his asks 2026-11-15:
// first "this border beam around the border of the phone", then "put the border beam just around the image when processing the
// food including the demo, also make it blue themed colors"). Blues only, so it stays inside the app's palette (docs/DESIGN.md,
// effects.registry processing-beam).
//
// Built cheap for iPhone Safari instead of using the border-beam package (that one runs a 30 fps requestAnimationFrame loop and
// animates conic gradients and blur filters):
//   - the colors are drawn ONCE into a small canvas (256 x 256);
//   - the canvas only rotates (a CSS transform animation, run by the compositor; no per-frame JS, no repaint);
//   - a static mask (an SVG built once per radius) cuts it to a thin ring plus a soft inner glow; no animated blur anywhere;
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

// Blues around the ring, with two brighter beams opposite each other, so both long edges of the photo always carry one.
function paint(cv: HTMLCanvasElement) {
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const img = ctx.createImageData(SIZE, SIZE);
  // the app's blues: hue sweeps 215 (sky) to 265 (indigo) and back twice around the ring, around the primary --p9 (about 250)
  const lut = Array.from({ length: 360 }, (_, d) => oklchToRgb(0.66, 0.17, 240 + 25 * Math.cos((2 * d * Math.PI) / 180)));
  const c = SIZE / 2;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const deg = ((Math.atan2(y + 0.5 - c, x + 0.5 - c) * 180) / Math.PI + 360) % 360;
      const fromBeam = Math.min(deg % 180, 180 - (deg % 180)); // 0 at a beam's head, 90 halfway between the two
      const lift = Math.max(0, Math.cos((Math.min(fromBeam, 70) / 70) * (Math.PI / 2))) ** 2;
      const [r, g, b] = lut[Math.floor(deg)].map((v, k) => Math.round(v + (255 - v) * 0.35 * lift * (k === 2 ? 0.4 : 1))) as [number, number, number];
      const i = (y * SIZE + x) * 4;
      img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b;
      img.data[i + 3] = Math.round(255 * (0.32 + 0.68 * lift));
    }
  }
  ctx.putImageData(img, 0, 0);
}

/** The ring mask for a frame with corner radius r: a 2.5px line on the edge plus a soft glow about 12px deep inside it. */
function maskFor(r: number) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg'><defs><clipPath id='c'><rect width='100%' height='100%' rx='${r}'/></clipPath><filter id='b' x='-10%' y='-10%' width='120%' height='120%'><feGaussianBlur stdDeviation='5'/></filter></defs><g clip-path='url(#c)' fill='none' stroke='#000'><rect width='100%' height='100%' rx='${r}' stroke-width='20' stroke-opacity='0.5' filter='url(#b)'/><rect width='100%' height='100%' rx='${r}' stroke-width='5'/></g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Sits inside the photo frame (position: relative, overflow hidden); `radius` matches the frame's corners. */
export function ProcessingBeam({ radius = 24 }: { radius?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const mask = maskFor(radius);
  const reduce = useReducedMotion();
  useEffect(() => { if (ref.current) paint(ref.current); }, []);
  return (
    <motion.div
      className={css.beam}
      style={{ borderRadius: radius, WebkitMaskImage: mask, maskImage: mask }}
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
