import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "SaaS Revenue Throughput Calculator",
  description:
    "Full-funnel SaaS revenue architecture with acquisition, retention, and profitability modelling."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
