import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Analytics Hub — DevForge";

export default function OgImage() {
  return generateOgImage({
    title: "Analytics Hub",
    description: "Page views, unique visitors, funnels and real-time user activity.",
    tag: "Hub",
  });
}
