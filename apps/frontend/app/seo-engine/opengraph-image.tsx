import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "SEO Engine — DevForge";

export default function OgImage() {
  return generateOgImage({
    title: "SEO Engine",
    description: "Generate meta tags, OG previews, sitemaps and run full SEO audits.",
    tag: "Hub",
  });
}
