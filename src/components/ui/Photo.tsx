// Owner: Arshawn. Food photo with optional label pills on top (DESIGN pattern: photos do the talking).
export function Photo({ src, w = "100%", h, r, alt = "", children }: { src: string; w?: number | string; h: number; r?: number; alt?: string; children?: React.ReactNode }) {
  return (
    <div className="ph" style={{ width: w, height: h, borderRadius: r }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} />
      {children}
    </div>
  );
}
