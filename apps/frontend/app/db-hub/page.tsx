import type { Metadata } from "next";
import DbHub from "./_components/db-hub";

export const metadata: Metadata = {
  title: "DB Hub",
  description: "Manage PostgreSQL, MySQL, MongoDB and Redis databases — DBeaver alternative in DevForge.",
};

export default function Page() {
  return <DbHub />;
}
