import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { url: "/", priority: 1.0, changeFrequency: "daily" as const },
    { url: "/api-hub", priority: 0.8, changeFrequency: "weekly" as const },
    { url: "/db-hub", priority: 0.8, changeFrequency: "weekly" as const },
    { url: "/logs-hub", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "/monitoring-hub", priority: 0.8, changeFrequency: "daily" as const },
    { url: "/error-tracker", priority: 0.8, changeFrequency: "daily" as const },
    { url: "/analytics-hub", priority: 0.7, changeFrequency: "daily" as const },
    { url: "/performance-hub", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "/security-center", priority: 0.8, changeFrequency: "weekly" as const },
    { url: "/ai-engine", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "/devops-hub", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "/project-generator", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "/cicd-hub", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "/seo-engine", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "/env-manager", priority: 0.6, changeFrequency: "weekly" as const },
    { url: "/plugin-system", priority: 0.6, changeFrequency: "weekly" as const },
  ];

  return routes.map(({ url, priority, changeFrequency }) => ({
    url: `${BASE_URL}${url}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
