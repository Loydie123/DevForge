import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "CI/CD Hub — DevForge";

export default function OgImage() {
  return generateOgImage({
    title: "CI/CD Hub",
    description: "Monitor pipelines, builds, deployments and release history.",
    tag: "Hub",
  });
}
