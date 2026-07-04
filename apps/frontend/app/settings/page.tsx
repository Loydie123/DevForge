import type { Metadata } from "next";
import SettingsPage from "./_components/settings-page";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your DevForge account settings, profile and password.",
};

export default function Settings() {
  return <SettingsPage />;
}
