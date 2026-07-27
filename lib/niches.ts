export interface NicheData {
  slug: string;
  title: string;
  description: string;
  heading: string;
  subheading: string;
  defaultPrompt: string;
  defaultRate: number;
}

export const NICHES: Record<string, NicheData> = {
  "web-design-quote-generator": {
    slug: "web-design-quote-generator",
    title: "Free Web Design Quote Generator | Instant PDF Proposals",
    description: "Generate professional A4 PDF quotes for web design projects in seconds. Powered by AI estimations for wireframing, UI/UX, and development.",
    heading: "Web Design Quote Generator",
    subheading: "Create client-ready web design quotes with itemized deliverables in seconds.",
    defaultPrompt: "Complete redesign of a 5-page WordPress website including Figma design, responsiveness, and basic SEO optimization.",
    defaultRate: 65,
  },
  "copywriting-quote-generator": {
    slug: "copywriting-quote-generator",
    title: "Free Copywriting Quote & Proposal Generator",
    description: "Build official PDF quotes for copywriting and content creation projects. Auto-estimate hours for blog posts, landing pages, and ad copy.",
    heading: "Copywriting Quote Builder",
    subheading: "Professional PDF proposal generator tailored for freelance copywriters.",
    defaultPrompt: "4 SEO blog posts per month plus landing page copywriting and email campaign sequences.",
    defaultRate: 50,
  },
  "graphic-design-quote-generator": {
    slug: "graphic-design-quote-generator",
    title: "Graphic Design PDF Quote Generator",
    description: "Instantly build official PDF quotes for brand identity, logo design, and marketing collateral.",
    heading: "Graphic Design Quote Generator",
    subheading: "Itemize brand identity packages, revisions, and export formats into an official A4 quote.",
    defaultPrompt: "Complete brand identity package including primary logo, color palette, brand guidelines PDF, and social media assets.",
    defaultRate: 55,
  },
  "seo-consulting-quote-builder": {
    slug: "seo-consulting-quote-builder",
    title: "SEO Consulting Quote & Estimate Builder",
    description: "Create official SEO proposals and monthly retainer quotes with auto-calculated hours and VAT lookup.",
    heading: "SEO Consulting Quote Builder",
    subheading: "Structure technical audits, keyword research, and link building into professional PDF proposals.",
    defaultPrompt: "Initial technical SEO audit, monthly keyword tracking, content strategy, and on-page optimization.",
    defaultRate: 80,
  },
};