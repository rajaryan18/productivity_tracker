"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const expiration = localStorage.getItem("authExpiration");

    if (storedUser && token) {
      // Check if expired (6 months)
      if (expiration && Date.now() > parseInt(expiration)) {
        handleLogout();
        return;
      }
      setUser(JSON.parse(storedUser));
    } else {
      // Redirect to login if not on public routes
      const publicRoutes = ["/login", "/signup"];
      if (!publicRoutes.includes(pathname) && !pathname.startsWith("/api/auth")) {
        router.push("/login");
      }
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("authExpiration");
    setUser(null);
    router.push("/login");
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="top-nav">
          <Link href="/">
            <h1 className="gradient-text" style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>ProdTracker</h1>
          </Link>
          <div className="nav-links">
            <Link href="/" className={pathname === "/" ? "active" : ""}>Dashboard</Link>
            <Link href="/calendar" className={pathname === "/calendar" ? "active" : ""}>Calendar</Link>
            <Link href="/analytics" className={pathname === "/analytics" ? "active" : ""}>Analytics</Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>{user.name}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{user.email}</div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="glass-panel"
                  style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "0.8rem", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" }}
                >
                  Logout
                </button>
              </div>
            ) : (
              pathname !== "/login" && pathname !== "/signup" && (
                <Link href="/login" className="primary-button" style={{ padding: "8px 20px", fontSize: "0.85rem" }}>
                  Sign In
                </Link>
              )
            )}
          </div>
        </nav>
        <main style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
