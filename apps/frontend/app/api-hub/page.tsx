import type { Metadata } from "next";
import ApiHub from "./_components/api-hub";

export const metadata: Metadata = {
  title: "API Hub",
  description: "Test REST, GraphQL, WebSocket and gRPC APIs — Postman alternative built into DevForge.",
};

export default function Page() {
  return <ApiHub />;
}
