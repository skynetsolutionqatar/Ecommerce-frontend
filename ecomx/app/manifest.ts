import type { MetadataRoute } from "next";
import { getClientConfig } from "@/config/clients";

export default function manifest(): MetadataRoute.Manifest {
  const client = getClientConfig();

  return {
    id: "/",
    name: client.name,
    short_name: client.name,
    description:
      "Shop POS systems, printers, scanners, and ERP solutions from Skynet Solution Qatar.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "fullscreen"],
    orientation: "portrait-primary",
    background_color: "#f1f3f6",
    theme_color: "#0a255d",
    categories: ["shopping", "business"],
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/skynet-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}