import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Use system fonts as fallback when Google Fonts unavailable
const fontClassName = "font-sans";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: "Speed Reader - Enhance Your Reading Skills",
  description: "Enhance your reading speed and comprehension with multiple reading modes, real-time analytics, and interactive practice sessions.",
  keywords: ["speed reading", "reading comprehension", "WPM", "reading practice", "learning"],
  authors: [{ name: "Speed Reader Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontClassName} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

