import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Performance Hub — DevForge";

export default function OgImage() {
  return generateOgImage({
    title: "Performance Hub",
    description: "API response times, slow query detection and bottleneck analysis.",
    tag: "Hub",
  });
}
