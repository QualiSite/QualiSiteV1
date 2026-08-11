import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import "./globals.scss";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://qualisite.alithiel31.dev";
const title = "QualiSite — Votre présence digitale sans compromis";
const description =
  "QualiSite conçoit des sites internet et applications web sur-mesure pour les entrepreneurs et PME.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "QualiSite",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
