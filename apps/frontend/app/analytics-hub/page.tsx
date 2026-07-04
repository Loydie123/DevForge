import type { Metadata } from "next";
import AnalyticsHub from "./_components/analytics-hub";

export const metadata: Metadata = {
  title: "Analytics Hub",
  description: "Track page views, user behavior, events and real-time active users.",
};

export default function Page() {
  return <AnalyticsHub />;
}
