import type { MetadataRoute } from "next";

/** Lets phones install tudu to the home screen and open it full screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "tudu",
    short_name: "tudu",
    description: "A minimal, distraction-free daily to-do list.",
    start_url: "/today",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
