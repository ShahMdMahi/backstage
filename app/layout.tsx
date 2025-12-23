import "@/app/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegister } from "@/components/shared/service-worker-register";

export const metadata: Metadata = {
  title: "RoyalMotionIT Backstage",
  description:
    "Backstage is a professional dashboard for managing RoyalMotionIT's music distribution operations.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  manifest: "/manifest.webmanifest",
  other: {
    "apple-mobile-web-app-title": "Backstage",
  },
  authors: [{ name: "RoyalMotionIT", url: "https://royalmotionit.com" }],
  keywords: ["RoyalMotionIT", "Backstage", "Music Distribution", "Dashboard"],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
