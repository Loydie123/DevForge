import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Security Center — DevForge";

export default function OgImage() {
  return generateOgImage({
    title: "Security Center",
    description: "JWT inspection, rate limit monitoring, audit logs and IP detection.",
    tag: "Hub",
  });
}
