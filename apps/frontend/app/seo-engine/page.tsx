import type { Metadata } from "next";
import SeoEngine from "./_components/seo-engine";

export const metadata: Metadata = {
  title: "SEO Engine",
  description: "Generate meta tags, preview Open Graph cards, build sitemaps and manage robots.txt.",
};

export default function SeoEnginePage() {
  return <SeoEngine />;
}
