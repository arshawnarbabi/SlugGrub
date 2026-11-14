import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TabBar } from "@/components/ui/TabBar";
import "./globals.css";

// Owner: Arshawn (shared shell). Ask before changing.

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SlugGrub",
  description: "UCSC dining, ranked by students.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <main className="mx-auto max-w-md px-4 pt-6 pb-28">{children}</main>
        <TabBar />
      </body>
    </html>
  );
}
