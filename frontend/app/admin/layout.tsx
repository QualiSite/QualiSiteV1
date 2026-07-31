"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoading && !user && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [user, isLoading, router, isLoginPage]);

  // La page de login s'affiche toujours
  if (isLoginPage) return <>{children}</>;

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1C0F06",
        }}
      >
        <p style={{ color: "#FFFAF6" }}>Chargement...</p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
