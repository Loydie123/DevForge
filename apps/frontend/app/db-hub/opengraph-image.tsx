import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "DB Hub — DevForge";

export default function OgImage() {
  return generateOgImage({
    title: "DB Hub",
    description: "Manage MySQL, PostgreSQL, MongoDB and Redis databases with ease.",
    tag: "Hub",
  });
}
