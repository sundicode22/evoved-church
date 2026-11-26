import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/lib/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Evolve Church — Modern Church Management & Leadership OS",
  description: "All-in-one church management — people, giving, calendar, campaigns, and multi-location ops.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(inter.variable, inter.className, "h-full antialiased font-sans")}
    >
      <body
        className={cn(
          inter.className,
          "flex min-h-full flex-col bg-background font-sans font-normal text-foreground antialiased"
        )}
      >
        <NextTopLoader color="#6495ed" height={3} showSpinner={false} />
        <ThemeProvider>
          <TooltipProvider>
            <QueryProvider>{children}</QueryProvider>
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
