import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "DevOps Hub — DevForge";

export default function OgImage() {
  return generateOgImage({
    title: "DevOps Hub",
    description: "Manage Docker containers, Compose files and Kubernetes configs.",
    tag: "Hub",
  });
}
