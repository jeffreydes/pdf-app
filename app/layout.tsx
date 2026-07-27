import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AnalyticsWrapper from "./AnalyticsWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuoteBuilder | AI-Powered PDF Quotes",
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
  alternates: {
    canonical: 'https://www.pdfbuilder.org', 
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = [
    {
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
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does the AI Quote Generator estimate hours and rates?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our AI engine analyzes your project description, identifies key deliverables, and estimates realistic hours based on industry standards. If you specify an hourly rate (e.g., 'rate 50'), it automatically calculates the total line items accordingly."
          }
        },
        {
          "@type": "Question",
          "name": "Can I automatically import company data (KBO / VAT)?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! By typing your company name or client name in the Smart Company Search bar, our system connects directly with public enterprise registries to auto-fill official registered names, addresses, and VAT numbers."
          }
        },
        {
          "@type": "Question",
          "name": "Is the generated PDF quote legally binding and official?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely. Every generated PDF includes official quote components: unique Quote tracking numbers, issue & expiry dates, itemized breakdowns with VAT rates, terms & conditions, and formal client approval signature blocks."
          }
        },
        {
          "@type": "Question",
          "name": "What is the difference between 'Download free quote' and 'Download Full PDF'?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Downloading a free quote provides a draft document containing a watermark for quick previews and internal review. Downloading the full PDF provides an un-watermarked, official document ready to send directly to your client."
          }
        }
      ]
    }
  ];

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
        <AnalyticsWrapper />
      </body>
    </html>
  );
}