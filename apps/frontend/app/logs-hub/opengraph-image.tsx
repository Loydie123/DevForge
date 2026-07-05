import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Logs Hub — DevForge";

export default function OgImage() {
  return generateOgImage({
    title: "Logs Hub",
    description: "Stream, search and filter backend, API and system logs in real-time.",
    tag: "Hub",
  });
}
