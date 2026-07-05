import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Error Tracker — DevForge";

export default function OgImage() {
  return generateOgImage({
    title: "Error Tracker",
    description: "Capture exceptions, stack traces and error groups across all services.",
    tag: "Hub",
  });
}
