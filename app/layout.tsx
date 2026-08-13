import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEXUS — AI Agent Operating System",
  description: "NEXUS final AI agent operating system — build, run and observe specialized agents with explicit tools and execution traces.",
  icons: { icon: "/nexus.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
