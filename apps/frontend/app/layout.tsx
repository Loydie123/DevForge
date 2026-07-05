import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./styles/globals.css";
import Providers from "../providers";
import { WorkspaceProvider } from "../components/workspace-context";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "DevForge",
    template: "%s — DevForge",
  },
  description: "Universal Developer Operating System — API Hub, DB Hub, Monitoring, Logs, Analytics, Security, CI/CD and more in one unified platform.",
  keywords: ["developer tools", "devops", "api testing", "monitoring", "logs", "analytics", "database"],
  authors: [{ name: "DevForge Team" }],
  openGraph: {
    title: "DevForge",
    description: "Universal Developer Operating System (DevOS)",
    type: "website",
    siteName: "DevForge",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevForge",
    description: "Universal Developer Operating System — API Hub, DB Hub, Monitoring, Logs, Analytics, Security, CI/CD and more.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#07090e]">
        <Providers>
          <WorkspaceProvider>{children}</WorkspaceProvider>
        </Providers>
      </body>
    </html>
  );
}

