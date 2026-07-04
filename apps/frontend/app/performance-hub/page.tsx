import type { Metadata } from "next";
import PerformanceHub from "./_components/performance-hub";

export const metadata: Metadata = {
  title: "Performance Hub",
  description: "Track API response times, detect slow queries and analyze route performance.",
};

export default function PerformanceHubPage() {
  return <PerformanceHub />;
}
