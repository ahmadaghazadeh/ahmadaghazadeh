import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/space-grotesk";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3001"),
  title: "Ahmad Aghazadeh — Senior Software Engineer",
  description: "14+ years building scalable backend systems and full-stack applications. Explore Ahmad Aghazadeh’s work, career, and approach to software engineering.",
  openGraph: { title: "Ahmad Aghazadeh — Engineering with intent", description: "Scalable systems. Thoughtful software. Senior software engineering, from architecture to delivery.", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image", title: "Ahmad Aghazadeh — Senior Software Engineer", description: "Scalable systems. Thoughtful software." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
