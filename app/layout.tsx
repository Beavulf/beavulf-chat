import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryAppProviders } from "@/providers/query-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Beavulf Chat",
  description: "Beavulf Chat is a chat application for the Beavulf community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryAppProviders>
          {children}
        </QueryAppProviders>
      </body>
    </html>
  );
}
