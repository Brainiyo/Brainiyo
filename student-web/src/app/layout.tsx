import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import CookieConsent from "@/components/CookieConsent";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6366f1',
  interactiveWidget: 'resizes-content',
};

export const metadata: Metadata = {
  title: "Brainiyo Student Portal | Master JEE & NEET",
  description: "Advanced adaptive practice platform for JEE/NEET aspirants. Real-time analytics, mock tests, and personalized study paths.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <UserProvider>
            {children}
            <CookieConsent />

            {/* MathJax config — must run before the library loads */}
            <Script id="mathjax-config" strategy="beforeInteractive">
              {`
                window.MathJax = {
                  tex: {
                    inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                    displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
                    processEscapes: true
                  },
                  options: {
                    enableMenu: false
                  }
                };
              `}
            </Script>

            {/* MathJax CDN */}
            <Script
              src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
              strategy="afterInteractive"
            />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
