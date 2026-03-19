import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Productivity Tracker",
  description: "Track your daily productivity and schedule events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="top-nav">
          <Link href="/">
            <h1 className="gradient-text" style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>ProdTracker</h1>
          </Link>
          <div className="nav-links">
            <Link href="/">Dashboard</Link>
            <Link href="/calendar">Calendar</Link>
            <Link href="/analytics">Analytics</Link>
          </div>
        </nav>
        <main style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
