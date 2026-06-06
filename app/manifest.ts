import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kaji Hunter",
    short_name: "Kaji Hunter",
    description: "家事をクエスト化するアプリ",
    start_url: "/",
    display: "standalone",
    background_color: "#fef6e9",
    theme_color: "#f97316",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}