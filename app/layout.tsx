import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryAppProviders } from "@/providers/query-provider";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Beavulf Chat",
  description: "Умный AI-чат на базе Beavulf.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${inter.className} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#212121] text-white">
        <QueryAppProviders>
          {children}
        </QueryAppProviders>
      </body>
    </html>
  );
}
