// Owner: Arshawn. Brand kit only: candidate UI fonts to compare (all free Google Fonts, plus the system font).
import { Inter, Manrope, Plus_Jakarta_Sans, DM_Sans, Figtree, Instrument_Sans, Onest, Outfit } from "next/font/google";

export const inter = Inter({ subsets: ["latin"], variable: "--f-inter" });
export const manrope = Manrope({ subsets: ["latin"], variable: "--f-manrope" });
export const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--f-jakarta" });
export const dmsans = DM_Sans({ subsets: ["latin"], variable: "--f-dmsans" });
export const figtree = Figtree({ subsets: ["latin"], variable: "--f-figtree" });
export const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--f-instrument" });
export const onest = Onest({ subsets: ["latin"], variable: "--f-onest" });
export const outfit = Outfit({ subsets: ["latin"], variable: "--f-outfit" });

export const FONT_VARS = [inter, manrope, jakarta, dmsans, figtree, instrument, onest, outfit].map((f) => f.variable).join(" ");

export const FONTS = [
  { id: "system", label: "System (SF Pro)", css: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif', note: "Native on iPhone and Mac, loads instantly. What Cal AI and Apple use." },
  { id: "geist", label: "Geist", css: "var(--font-geist-sans), system-ui, sans-serif", note: "Vercel's font. Crisp and technical, a little cool." },
  { id: "inter", label: "Inter", css: "var(--f-inter), system-ui, sans-serif", note: "The safe premium default. Very neutral, great numbers." },
  { id: "manrope", label: "Manrope", css: "var(--f-manrope), system-ui, sans-serif", note: "Modern geometric with soft edges. Friendly but clean." },
  { id: "jakarta", label: "Plus Jakarta Sans", css: "var(--f-jakarta), system-ui, sans-serif", note: "Rounder and warmer. Popular in polished consumer apps." },
  { id: "dmsans", label: "DM Sans", css: "var(--f-dmsans), system-ui, sans-serif", note: "Low contrast and compact. Calm, a bit editorial." },
  { id: "figtree", label: "Figtree", css: "var(--f-figtree), system-ui, sans-serif", note: "Friendly and very readable. Good for a student app." },
  { id: "instrument", label: "Instrument Sans", css: "var(--f-instrument), system-ui, sans-serif", note: "Sharp and stylish, with a slightly narrow feel." },
  { id: "onest", label: "Onest", css: "var(--f-onest), system-ui, sans-serif", note: "Clean and contemporary, between Inter and Manrope." },
  { id: "outfit", label: "Outfit", css: "var(--f-outfit), system-ui, sans-serif", note: "Geometric and bold. Playful, strong headlines." },
] as const;
export type FontId = (typeof FONTS)[number]["id"];
