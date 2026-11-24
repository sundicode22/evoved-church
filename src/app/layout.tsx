import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/lib/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

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
      className={cn(inter.variable, inter.className, "h-full antialiased font-sans")}
    >
      <body className={cn(inter.className, "min-h-full flex flex-col bg-white font-sans font-normal text-zinc-900 antialiased")}>
        <TooltipProvider>
          <QueryProvider>{children}</QueryProvider>
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
