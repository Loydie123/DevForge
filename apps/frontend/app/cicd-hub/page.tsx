import type { Metadata } from "next";
import CicdHub from "./_components/cicd-hub";

export const metadata: Metadata = {
  title: "CI/CD Hub",
  description: "Manage pipelines, trigger builds, view run history and monitor deployments.",
};

export default function CicdHubPage() {
  return <CicdHub />;
}
