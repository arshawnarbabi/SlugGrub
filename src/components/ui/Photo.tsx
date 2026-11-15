// Owner: Arshawn. Food photo with optional label pills on top (DESIGN pattern: photos do the talking).
// Performance: picks a copy sized to how big it is drawn (2x for sharp retina), so a 48px thumbnail never decodes a 720px photo.
// public/food/sm = 160px, md = 360px, full = 720px. Decoding is async and off-screen photos load lazily.
function sized(src: string, w: number | string, h: number) {
  const px = Math.max(typeof w === "number" ? w : 0, h);
  // generated dish images (/food/gen/) have no sized copies yet: serve the original rather than a missing file
  if (!src.startsWith("/food/") || src.startsWith("/food/gen/")) return src;
  const name = src.slice("/food/".length);
  if (typeof w === "number" && px <= 80) return `/food/sm/${name}`;
  if (typeof w === "number" && px <= 180) return `/food/md/${name}`;
  return src;
}

export function Photo({ src, w = "100%", h, r, alt = "", eager, children }: { src: string; w?: number | string; h: number; r?: number; alt?: string; eager?: boolean; children?: React.ReactNode }) {
  return (
    <div className="ph" style={{ width: w, height: h, borderRadius: r }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={sized(src, w, h)} alt={alt} decoding="async" loading={eager ? "eager" : "lazy"} width={typeof w === "number" ? w : undefined} height={h} />
      {children}
    </div>
  );
}
