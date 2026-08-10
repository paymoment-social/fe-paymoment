import type { Metadata, Viewport } from "next";
import { InitialSplash } from "@/components/branding/InitialSplash";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProviders } from "@/providers/AppProviders";
import { PwaRegistration } from "@/components/pwa/PwaRegistration";
import "./globals.css";


export const metadata: Metadata = {
  title: "PayMoment - Share moments. Earn Box.",
  description: "The social layer for PayBox builders, creators, and payment moments.",
  applicationName: "PayMoment",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/payboxlogo.png", type: "image/png", sizes: "190x190" }],
    apple: [{ url: "/payboxlogo.png", type: "image/png", sizes: "190x190" }],
  },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "PayMoment" },
};

export const viewport: Viewport = { colorScheme: "dark", themeColor: "#08090A" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <AppProviders>
          <InitialSplash />
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="top-center" offset={16} gap={8} />
          <PwaRegistration />
        </AppProviders>
      </body>
    </html>
  );
}
