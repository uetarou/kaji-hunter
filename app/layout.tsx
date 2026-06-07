import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kaji Hunter",
  description: "家事クエストを依頼・受注できるハンターアプリ",
  manifest: "/manifest.json",

  themeColor: "#07111f",

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        style={{
          background: "#07111f",
          color: "white",
          margin: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}