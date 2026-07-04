import type { Metadata } from "next";
import SecurityCenter from "./_components/security-center";

export const metadata: Metadata = {
  title: "Security Center",
  description: "JWT inspection, rate limit monitoring, suspicious IP detection and audit logs.",
};

export default function Page() {
  return <SecurityCenter />;
}
