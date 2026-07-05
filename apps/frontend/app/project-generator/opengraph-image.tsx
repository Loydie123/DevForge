import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Project Generator — DevForge";

export default function OgImage() {
  return generateOgImage({
    title: "Project Generator",
    description: "Bootstrap new projects with auth, RBAC and clean architecture.",
    tag: "Hub",
  });
}
