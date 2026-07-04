import type { Metadata } from "next";
import EnvManager from "./_components/env-manager";

export const metadata: Metadata = {
  title: "Environment Manager",
  description: "Manage dev, staging and production configs, secrets vault and config version history.",
};

export default function EnvManagerPage() {
  return <EnvManager />;
}
