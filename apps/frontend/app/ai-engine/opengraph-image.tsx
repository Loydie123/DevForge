import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "AI Engine — DevForge";

export default function OgImage() {
  return generateOgImage({
    title: "AI Engine",
    description: "Generate code, explain errors and get architecture suggestions with AI.",
    tag: "Hub",
  });
}
