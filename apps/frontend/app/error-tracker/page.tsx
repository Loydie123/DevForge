import type { Metadata } from "next";
import ErrorTracker from "./_components/error-tracker";

export const metadata: Metadata = {
  title: "Error Tracker",
  description: "Track exceptions, stack traces and error groups — Sentry alternative in DevForge.",
};

export default function Page() {
  return <ErrorTracker />;
}
