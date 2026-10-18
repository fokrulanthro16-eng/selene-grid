import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SELENE-GRID v2.0 | Cislunar AI & Green Compiler",
  description: "Earth-to-Lunar Carbon-Aware Distributed AI Orchestrator & Ada-Lovelace Equity Protocol",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-cyber-950 text-white min-h-screen antialiased selection:bg-lunar-cyan/30 selection:text-lunar-cyan">
        {children}
      </body>
    </html>
  );
}
