import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NICHES } from '@/lib/niches';
// Import your main quote generator component here (e.g., QuoteBuilderApp)
import Home from '../page'; 

interface Props {
  params: Promise<{ niche: string }>;
}

// 1. Generate custom SEO meta tags for each dynamic page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const nicheData = NICHES[resolvedParams.niche];

  if (!nicheData) return {};

  return {
    title: nicheData.title,
    description: nicheData.description,
    alternates: {
      canonical: `https://www.pdfbuilder.org/${nicheData.slug}`,
    },
    openGraph: {
      title: nicheData.title,
      description: nicheData.description,
      url: `https://www.pdfbuilder.org/${nicheData.slug}`,
      type: 'website',
    },
  };
}

// 2. Pre-render these pages at build time for instant loading
export async function generateStaticParams() {
  return Object.keys(NICHES).map((slug) => ({
    niche: slug,
  }));
}

// 3. Render the page
export default async function NichePage({ params }: Props) {
  const resolvedParams = await params;
  const nicheData = NICHES[resolvedParams.niche];

  if (!nicheData) {
    notFound();
  }

  // Pass niche data directly into your existing page interface
  return <Home nicheData={nicheData} />;
}