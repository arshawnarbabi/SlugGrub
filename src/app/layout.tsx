import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { TabBar } from "@/components/ui/TabBar";
import "./globals.css";

// Owner: Arshawn (shared shell). Ask before changing. Font: Manrope (DESIGN typography, his pick).
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "SlugGrub",
  description: "UCSC dining, ranked by students.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#eceef0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        <div className="app">
          {children}
          <TabBar />
        </div>
      </body>
    </html>
  );
}
