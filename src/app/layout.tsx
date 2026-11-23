import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/lib/query-provider";

export const metadata: Metadata = {
  title: "Evolve Church — Modern Church Management & Leadership OS",
  description: "Next-generation ChMS with visual organigram, fund accounting, visitor CRM pipeline, and multi-campus management.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans")}
    >
      <body className="min-h-full flex flex-col bg-[#fbfcfb] text-zinc-900 antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
