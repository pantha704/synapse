import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Synapse — AI-Powered Learning",
  description:
    "A multi-tenant, AI-powered learning management system with interactive mindmap progress visualization.",
  keywords: ["edtech", "lms", "learning", "mindmap", "ai"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[hsl(220,20%,6%)] text-white">
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
