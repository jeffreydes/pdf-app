import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuoteBuilder",
  description: "Create official, client-ready PDF quotes in seconds based on your project idea, hourly rate, or company VAT number. Free preview & instant download.",
  keywords: [
    "quote maker",
    "free pdf quote generator",
    "invoice and quote builder",
    "ai quote generator",
    "official proposal pdf",
    "hourly rate quote calculator"
  ],
  openGraph: {
    title: "QuoteBuilder",
    description: "Generate professional A4 PDF quotes automatically with AI project estimation and instant company lookup.",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "QuoteBuilder",
    "operatingSystem": "All",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "description": "Generate professional and official PDF quotes in seconds with smart AI project estimation and automatic company lookup."
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}