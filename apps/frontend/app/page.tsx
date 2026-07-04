import type { Metadata } from "next";
import Dashboard from "./_components/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "DevForge unified developer dashboard — monitor all your services at a glance.",
};

export default function Home() {
  return <Dashboard />;
}
