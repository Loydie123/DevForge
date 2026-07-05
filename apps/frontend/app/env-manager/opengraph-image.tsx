import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Env Manager — DevForge";

export default function OgImage() {
  return generateOgImage({
    title: "Env Manager",
    description: "Manage dev, staging and production configs, secrets and API keys.",
    tag: "Hub",
  });
}
