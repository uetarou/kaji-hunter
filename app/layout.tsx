import type { Metadata, Viewport } from "next";
import { Orbitron, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "Kaji Hunter",
  description: "家事クエストを依頼・受注できるハンターアプリ",
  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kaji Hunter",
  },

  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#07111f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`
          ${orbitron.variable}
          ${notoSansJP.variable}
          bg-[#07111f]
          text-white
        `}
      >
        {children}
      </body>
    </html>
  );
}