import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "API Hub — DevForge";

export default function OgImage() {
  return generateOgImage({
    title: "API Hub",
    description: "Test REST, GraphQL, WebSocket and gRPC APIs from one unified workspace.",
    tag: "Hub",
  });
}
