import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "URL Shortener",
  description: "Shorten URLs and track click analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="text-xl font-bold text-indigo-600 dark:text-indigo-400"
            >
              URL Shortener
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
            >
              Dashboard
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
