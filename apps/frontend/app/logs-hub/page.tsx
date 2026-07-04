import type { Metadata } from "next";
import LogsHub from "./_components/logs-hub";

export const metadata: Metadata = {
  title: "Logs Hub",
  description: "View backend, API, system and Docker logs in real-time.",
};

export default function LogsHubPage() {
  return <LogsHub />;
}
