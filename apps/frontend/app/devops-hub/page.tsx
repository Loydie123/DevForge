import type { Metadata } from "next";
import DevopsHub from "./_components/devops-hub";

export const metadata: Metadata = {
  title: "DevOps Hub",
  description: "Docker management, Compose editor, Kubernetes configs and VPS deployment tools.",
};

export default function DevopsHubPage() {
  return <DevopsHub />;
}
