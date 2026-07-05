import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Plugin System — DevForge";

export default function OgImage() {
  return generateOgImage({
    title: "Plugin System",
    description: "Install plugins, configure hooks and extend DevForge with the marketplace.",
    tag: "Hub",
  });
}
