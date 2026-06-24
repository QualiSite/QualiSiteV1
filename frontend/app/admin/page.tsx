"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function AdminPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", padding: "3rem 2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ color: "var(--ink)", fontSize: "1.8rem" }}>Dashboard</h1>
            <p style={{ color: "var(--muted)", marginTop: "0.25rem" }}>Connecté en tant que {user?.email}</p>
          </div>
          <button
            onClick={logout}
            style={{ background: "var(--orange)", color: "white", border: "none", padding: "0.6rem 1.25rem", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
          >
            Déconnexion
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          {[
            { label: "Contacts", href: "/admin/contacts" },
            { label: "Projets", href: "/admin/projects" },
            { label: "Services", href: "/admin/services" },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ background: "white", border: "1px solid var(--border)", borderRadius: "12px", padding: "2rem", textAlign: "center", color: "var(--ink)", fontWeight: 700, fontSize: "1.1rem", textDecoration: "none" }}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}