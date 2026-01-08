import type { Metadata } from "next";
import { Inter, Red_Hat_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { SPARedirect } from "@/components/spa-redirect";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "TLDR Content | Movies & Shows Discovery",
  description: "Discover movies and shows from India's top streaming platforms. Filter by genre, language, rating, and more.",
  keywords: ["movies", "shows", "streaming", "India", "Bollywood", "OTT", "Netflix", "Prime Video", "Hotstar"],
  authors: [{ name: "TLDR Content" }],
  openGraph: {
    title: "TLDR Content | Movies & Shows Discovery",
    description: "Discover movies and shows from India's top streaming platforms",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${redHatDisplay.variable} font-sans antialiased bg-background text-foreground`} style={{ fontFamily: 'var(--font-red-hat-display), system-ui, sans-serif' }}>
        <Providers>
          <SPARedirect />
          <Navbar />
          <main className="min-h-screen w-full">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
