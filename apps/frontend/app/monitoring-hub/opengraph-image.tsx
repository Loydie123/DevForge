import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Monitoring Hub — DevForge";

export default function OgImage() {
  return generateOgImage({
    title: "Monitoring Hub",
    description: "Track CPU, RAM, disk usage, uptime and API latency at a glance.",
    tag: "Hub",
  });
}
