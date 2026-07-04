import type { Metadata } from "next";
import PluginSystem from "./_components/plugin-system";

export const metadata: Metadata = {
  title: "Plugin System",
  description: "Install, manage and trigger extensible plugins with onRequest, onError, onMetric hooks.",
};

export default function PluginSystemPage() {
  return <PluginSystem />;
}
