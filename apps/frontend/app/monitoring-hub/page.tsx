import type { Metadata } from "next";
import MonitoringHub from "./_components/monitoring-hub";

export const metadata: Metadata = {
  title: "Monitoring Hub",
  description: "Monitor CPU, RAM, disk usage, API latency and service uptime in real-time.",
};

export default function MonitoringHubPage() {
  return <MonitoringHub />;
}
