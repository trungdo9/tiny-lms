import type { Metadata } from "next";
import { Geist, Geist_Mono, Archivo_Black, Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers";
import { GAInitializer } from "@/components/ga-initializer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tiny LMS - Interactive Online Learning Platform | Build Courses in Minutes",
  description:
    "Create and share engaging online courses with interactive quizzes, flashcards, and real-time analytics. Perfect for instructors, educators, and corporate training. Start free today.",
  keywords: [
    "online learning platform",
    "LMS software",
    "course builder",
    "interactive quizzes",
    "flashcards",
    "learning management system",
    "online education",
  ],
  openGraph: {
    title: "Tiny LMS - Interactive Online Learning Platform",
    description:
      "Create engaging online courses with built-in quizzes, flashcards, and student analytics.",
    url: "https://tinylms.com",
    siteName: "Tiny LMS",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://tinylms.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tiny LMS - Online Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tiny LMS - Interactive Online Learning Platform",
    description: "Build and share engaging courses with interactive tools and real-time analytics.",
    images: ["https://tinylms.com/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const schemaData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Tiny LMS",
  description:
    "Interactive online learning platform for creating and sharing courses with quizzes, flashcards, and analytics.",
  applicationCategory: "EducationalApplication",
  url: "https://tinylms.com",
  offers: {
    "@type": "Offer",
    priceCurrency: "USD",
    price: "0",
    priceValidUntil: "2026-12-31",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "100",
    bestRating: "5",
    worstRating: "1",
  },
  author: {
    "@type": "Organization",
    name: "Tiny LMS",
    url: "https://tinylms.com",
    logo: "https://tinylms.com/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://tinylms.com" />
        {/* Preload critical fonts for faster LCP */}
        <link
          rel="preload"
          href="/fonts/archivo-black.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/space-grotesk.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${archivoBlack.variable} ${spaceGrotesk.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>

        {/* Google Analytics 4 - fetched at runtime from DB, falls back to env var */}
        <GAInitializer />
      </body>
    </html>
  );
}
