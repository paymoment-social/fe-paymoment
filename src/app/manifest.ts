import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PayMoment - Share moments. Earn Box.",
    short_name: "PayMoment",
    description: "The social layer for PayMoment builders, creators, and payment moments.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#08090A",
    theme_color: "#08090A",
    categories: ["social", "finance", "productivity"],
    icons: [{ src: "/payboxlogo.png", sizes: "190x190", type: "image/png", purpose: "any" }],
  };
}
