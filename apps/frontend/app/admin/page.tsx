import type { Metadata } from "next";
import AdminPanel from "./_components/admin-panel";

export const metadata: Metadata = {
  title: "Admin",
  description: "DevForge admin panel — manage users, roles and system settings.",
};

export default function AdminPage() {
  return <AdminPanel />;
}
