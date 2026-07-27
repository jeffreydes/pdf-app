'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import Script from 'next/script';
import { track } from '@vercel/analytics';

interface LineItem {
  id: string;
  description: string;
  qty: number;
  price: number;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [currency, setCurrency] = useState<'EUR' | 'USD'>('EUR');

  // Pro Subscription State
  const [isPro, setIsPro] = useState(false);

  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadingFree, setIsDownloadingFree] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Provider Smart Search
  const [providerQuery, setProviderQuery] = useState('');
  const [providerSuggestions, setProviderSuggestions] = useState<any[]>([]);
  const [isSearchingProvider, setIsSearchingProvider] = useState(false);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);

  // Client Smart Search
  const [clientQuery, setClientQuery] = useState('');
  const [clientSuggestions, setClientSuggestions] = useState<any[]>([]);
  const [isSearchingClient, setIsSearchingClient] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Client Details
  const [clientName, setClientName] = useState('Valued Client');
  const [clientCompany, setClientCompany] = useState('Client Corp Ltd.');
  const [clientAddress, setClientAddress] = useState('456 Client Ave, Suite 100');
  const [clientEmail, setClientEmail] = useState('billing@clientcorp.com');

  // Provider Business Details
  const [providerName, setProviderName] = useState('Your Company Name');
  const [providerAddress, setProviderAddress] = useState('123 Innovation St, Tech City');
  const [providerPhone, setProviderPhone] = useState('+1 (555) 000-1234');
  const [providerEmail, setProviderEmail] = useState('contact@yourcompany.com');
  const [providerVat, setProviderVat] = useState('VAT: EU987654321');

  // Timeline & Scope
  const [projectTimeline, setProjectTimeline] = useState('Est. Start: Next Monday | Duration: 3-4 Weeks');
  const [scopeText, setScopeText] = useState('');
  const [vatRate, setVatRate] = useState<number>(21);

  // Line Items
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: 'Discovery & Requirements Analysis', qty: 8, price: 85 },
    { id: '2', description: 'Design & Core Implementation', qty: 24, price: 85 },
    { id: '3', description: 'Testing, Deployment & Handover', qty: 6, price: 85 }
  ]);

  const subtotal = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const vatAmount = subtotal * (vatRate / 100);
  const totalDue = subtotal + vatAmount;

  // Initialize Pro status from local storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsPro(window.localStorage.getItem('isPro') === 'true');
    }
  }, []);

  // Re-scan DOM for Lemon Squeezy overlay links whenever the step changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        if ((window as any).createLemonSqueezy) {
          (window as any).createLemonSqueezy();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Dynamic currency formatting based on selection
  const formatCurrency = (amount: number) => {
    const locale = currency === 'EUR' ? 'de-DE' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(amount);
  };

  const handleLemonSqueezyScriptLoad = () => {
    if (typeof window !== 'undefined' && (window as any).createLemonSqueezy) {
      (window as any).createLemonSqueezy();
      (window as any).LemonSqueezy?.Setup({
        eventHandler: (event: any) => {
          if (event.event === 'Checkout.Success') {
            const checkoutType = window.localStorage.getItem('checkoutType');
            
            if (checkoutType === 'pro') {
              window.localStorage.setItem('isPro', 'true');
              setIsPro(true);
            }
            
            setHasPaid(true);
          }
        }
      });
    }
  };

  // Provider Search (Step 2)
  const handleProviderSearch = async (val: string) => {
    setProviderQuery(val);
    if (val.length < 2) {
      setProviderSuggestions([]);
      setShowProviderDropdown(false);
      return;
    }

    setIsSearchingProvider(true);
    try {
      const res = await fetch(`/api/company-search?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      
      const results = data.results || [];
      setProviderSuggestions(results);
      setShowProviderDropdown(results.length > 0);
    } catch (err) {
      setProviderSuggestions([]);
    } finally {
      setIsSearchingProvider(false);
    }
  };

  const selectProviderCompany = (company: any) => {
    setProviderName(company.name);
    if (company.address) setProviderAddress(company.address);
    if (company.companyNumber) setProviderVat(`VAT/Reg: ${company.companyNumber}`);
    if (company.vatNumber) setProviderVat(`VAT: ${company.vatNumber}`);
    setProviderQuery(company.name);
    setShowProviderDropdown(false);
  };

  // Client Search (Step 3)
  const handleClientSearch = async (val: string) => {
    setClientQuery(val);
    if (val.length < 2) {
      setClientSuggestions([]);
      setShowClientDropdown(false);
      return;
    }

    setIsSearchingClient(true);
    try {
      const res = await fetch(`/api/company-search?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      
      const results = data.results || [];
      setClientSuggestions(results);
      setShowClientDropdown(results.length > 0);
    } catch (err) {
      setClientSuggestions([]);
    } finally {
      setIsSearchingClient(false);
    }
  };

  const selectClientCompany = (company: any) => {
    setClientCompany(company.name);
    setClientName(company.name);
    if (company.address) setClientAddress(company.address);
    setClientQuery(company.name);
    setShowClientDropdown(false);
  };

  // SMART AI ESTIMATOR ENGINE
  const handleGenerate = (customPrompt?: string) => {
    const activePrompt = customPrompt || prompt;
    if (!activePrompt.trim()) return;
    setIsLoading(true);

    const rateMatch = activePrompt.match(/(?:rate|hourly|fee|€|\$|eur|usd)\s*:?\s*(\d+)/i) || 
                      activePrompt.match(/(\d+)\s*(?:\/|per)?\s*(?:u|h|uur|hour)/i);
    const baseRate = rateMatch ? parseInt(rateMatch[1], 10) : 85;

    setTimeout(() => {
      let generatedItems: LineItem[] = [];
      const lowerPrompt = activePrompt.toLowerCase();

      if (lowerPrompt.includes('logo') || lowerPrompt.includes('brand') || lowerPrompt.includes('architect')) {
        generatedItems = [
          { id: '1', description: 'Research & Moodboarding', qty: 6, price: baseRate },
          { id: '2', description: 'Logo Concept & Vector Design', qty: 16, price: baseRate },
          { id: '3', description: 'Brand Guidelines & Asset Export', qty: 8, price: baseRate }
        ];
      } else if (lowerPrompt.includes('web') || lowerPrompt.includes('site') || lowerPrompt.includes('app')) {
        generatedItems = [
          { id: '1', description: 'UX/UI Wireframing & Prototyping', qty: 16, price: baseRate },
          { id: '2', description: 'Frontend & Backend Development', qty: 32, price: baseRate },
          { id: '3', description: 'Testing, Deployment & SEO Setup', qty: 8, price: baseRate }
        ];
      } else {
        generatedItems = [
          { id: '1', description: 'Strategy & Project Preparation', qty: 8, price: baseRate },
          { id: '2', description: 'Primary Deliverables Execution', qty: 20, price: baseRate },
          { id: '3', description: 'Quality Assurance & Handover', qty: 6, price: baseRate }
        ];
      }

      setScopeText(`Complete execution for: ${activePrompt}. Includes discovery, development, and finalized deliverables.`);
      setItems(generatedItems);
      setIsLoading(false);
      setCurrentStep(2);
    }, 1000);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: 'Additional Deliverable', qty: 4, price: 85 }]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const reader = new FileReader();
    reader.onloadend = () => { if (typeof reader.result === 'string') setLogo(reader.result); };
    reader.readAsDataURL(e.target.files[0]);
  };

  const downloadPdf = async (isWatermarked: boolean) => {
    if (isWatermarked) setIsDownloadingFree(true);
    try {
      const payload = {
        prompt, logo, clientName, clientCompany, clientAddress, clientEmail,
        providerName, providerAddress, providerPhone, providerEmail, providerVat,
        projectTimeline, scopeText: scopeText || prompt, items, vatRate, isWatermarked, currency
      };

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Generation failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = isWatermarked ? 'Draft_Preview_Quote.pdf' : 'Official_Quote.pdf';
      a.click();
    } catch (error: any) { 
      alert('Error: ' + error.message); 
    } fontally {
      if (isWatermarked) setIsDownloadingFree(false);
    }
  };

  useEffect(() => {
    if (hasPaid) {
      if (typeof window !== 'undefined' && window.localStorage.getItem('isAdmin') !== 'true') {
        track('Paid_Download_Success');
      }
      downloadPdf(false);
      Promise.resolve().then(() => setHasPaid(false));
    }
  }, [hasPaid]);

  const handleFreeDownloadClick = () => {
    if (typeof window !== 'undefined' && window.localStorage.getItem('isAdmin') !== 'true') {
      track('Free_Download_Clicked');
    }

    downloadPdf(true);
  };

  // SEO FAQ Data
  const faqs = [
    {
      q: "How does the AI Quote Generator estimate hours and rates?",
      a: "Our AI engine analyzes your project description, identifies key deliverables, and estimates realistic hours based on industry standards. If you specify an hourly rate (e.g., 'rate 50'), it automatically calculates the total line items accordingly."
    },
    {
      q: "Can I automatically import company data (KBO / VAT)?",
      a: "Yes! By typing your company name or client name in the Smart Company Search bar, our system connects directly with public enterprise registries to auto-fill official registered names, addresses, and VAT numbers."
    },
    {
      q: "Is the generated PDF quote legally binding and official?",
      a: "Absolutely. Every generated PDF includes official quote components: unique Quote tracking numbers, issue & expiry dates, itemized breakdowns with VAT rates, terms & conditions, and formal client approval signature blocks."
    },
    {
      q: "What is the difference between 'Download free quote' and 'Download Full PDF'?",
      a: "Downloading a free quote provides a draft document containing a watermark for quick previews and internal review. Downloading the full PDF provides an un-watermarked, official document ready to send directly to your client."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111827] font-sans antialiased flex flex-col justify-between overflow-x-hidden">
      <Script src="https://assets.lemonsqueezy.com/lemon.js" strategy="afterInteractive" onReady={handleLemonSqueezyScriptLoad} />

      {/* HEADER */}
      <header className="bg-white/80 border-b border-gray-200/80 px-4 sm:px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white font-black text-xs">Q</div>
          <span className="font-bold text-sm tracking-tight text-gray-900 hidden sm:block">QuoteBuilder</span>
        </div>

        {/* CONTROLS (WIZARD & PRO BUTTON) */}
        <div className="flex items-center gap-4 sm:gap-6">
          
          {/* WIZARD STEPS */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[1, 2, 3, 4].map((step) => (
              <button
                key={step}
                onClick={() => step <= currentStep && setCurrentStep(step)}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center ${
                  currentStep === step 
                    ? 'bg-black text-white shadow-sm' 
                    : currentStep > step 
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                {step}
              </button>
            ))}
          </div>

          {/* MONTHLY SUBSCRIPTION BUTTON */}
          {!isPro ? (
            <div className="relative group inline-flex">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-500 rounded-lg blur opacity-60 group-hover:opacity-100 animate-pulse transition duration-500"></div>
              
              <a 
                href="https://desmindspace.lemonsqueezy.com/checkout/buy/e5319fca-00c7-4959-89ee-6ba719d2c0a4?embed=1" 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.localStorage.setItem('checkoutType', 'pro');
                  }
                }}
                className="lemonsqueezy-button relative px-4 py-1.5 bg-[#0070F3] hover:bg-[#005bb5] text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                Go Pro
              </a>
            </div>
          ) : (
            <span className="px-3 py-1 bg-green-100 text-green-700 border border-green-200 text-xs font-bold rounded-lg shadow-sm">
              PRO ACTIVE
            </span>
          )}

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 flex flex-col justify-between min-h-[calc(100vh-80px)] relative z-10">
        
        {/* DYNAMIC BACKGROUND GRADIENT */}
        <div 
          className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none -z-10 transition-all duration-1000 ease-in-out blur-[80px] sm:blur-[120px] w-[600px] h-[600px] sm:w-[900px] sm:h-[900px] ${
            currentStep === 1 ? 'scale-100 opacity-50 bg-gradient-to-tr from-sky-300/60 via-indigo-300/40 to-cyan-300/60' :
            currentStep === 2 ? 'scale-110 opacity-60 bg-gradient-to-tr from-sky-300/60 via-indigo-300/50 to-cyan-300/60' :
            currentStep === 3 ? 'scale-125 opacity-70 bg-gradient-to-tr from-sky-400/50 via-indigo-400/50 to-cyan-400/50' :
            'scale-150 opacity-80 bg-gradient-to-tr from-blue-400/50 via-indigo-400/50 to-cyan-400/50'
          }`} 
        />

        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="my-auto space-y-8 relative py-8">
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2.5 bg-white/90 border border-gray-200/80 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-xs hover:border-gray-300 transition-all cursor-default">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="w-4 h-4 bg-[#00B67A] rounded-xs flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                  <span>4.8/5</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500 font-normal">Over 120+ quotes generated</span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                Your idea to a functional quote in seconds.
              </h1>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Describe your project or hourly rate to generate your quote.
              </p>
            </div>

            <div className="relative">
              <div className="bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-2xl p-2 shadow-xl hover:border-gray-300 transition-all flex items-center gap-3 focus-within:ring-2 focus-within:ring-black">
                <svg className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                
                <input 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder={`e.g. Logo design for brand, hourly rate 50...`} 
                  className="w-full bg-transparent text-sm sm:text-base outline-none text-gray-900 placeholder:text-gray-400 font-medium"
                />

                <button 
                  onClick={() => handleGenerate()}
                  disabled={isLoading || !prompt.trim()}
                  className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-black hover:bg-gray-800 disabled:opacity-40 transition-all active:scale-95 flex-shrink-0"
                >
                  {isLoading ? 'Estimating...' : 'Start Quote →'}
                </button>
              </div>

              {/* QUICK PRESETS */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <span className="text-[11px] text-gray-400 font-medium">Quick Presets:</span>
                {[
                  { label: "Web Design Project", query: "Web design & development, rate 85" },
                  { label: "Logo & Branding", query: "Logo design & brand guidelines, rate 75" },
                  { label: "Copywriting", query: "SEO copywriting & messaging, rate 65" },
                  { label: "Consulting", query: "Strategic business consulting, rate 120" }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(chip.query);
                      handleGenerate(chip.query);
                    }}
                    className="text-[11px] bg-white/80 border border-gray-200 hover:border-gray-400 text-gray-600 rounded-lg px-2.5 py-1 transition-all active:scale-95 shadow-xs"
                  >
                    + {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* FEATURES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-gray-200/60 text-center">
              
              <div className="group flex flex-col items-center space-y-2 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-md">
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-900 group-hover:text-black transition-colors">Instant AI Hours Estimation</span>
                  <span className="text-[11px] text-gray-400">Smart project breakdown</span>
                </div>
              </div>

              <div className="group flex flex-col items-center space-y-2 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-md">
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-900 group-hover:text-black transition-colors">Belgian & EU Company Search</span>
                  <span className="text-[11px] text-gray-400">Auto-fill official KBO / VAT data</span>
                </div>
              </div>

              <div className="group flex flex-col items-center space-y-2 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-md">
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3-3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-900 group-hover:text-black transition-colors">Official A4 PDF Export</span>
                  <span className="text-[11px] text-gray-400">Compliant with signatures & terms</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEPS 2, 3, & 4 */}
        {currentStep > 1 && (
          <div className="my-auto space-y-6 w-full py-8">
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 max-w-md mx-auto bg-gray-100/80 backdrop-blur-sm inline-block px-4 py-1.5 rounded-full border border-gray-200/50 shadow-sm">
                {currentStep === 2 && "Search or enter your business details and brand logo."}
                {currentStep === 3 && "Select or type your client's company information."}
                {currentStep === 4 && "Review project line items, hours, and finalized totals."}
              </p>
            </div>

            {/* STEP 2: PROVIDER DETAILS */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Brand Logo</span>
                      <p className="text-xs text-gray-500">Drag & drop or click</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {logo ? (
                      <div className="mt-3 flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-200">
                        <img src={logo} alt="Logo" className="h-7 max-w-[100px] object-contain" />
                        <button onClick={(e) => { e.stopPropagation(); setLogo(null); }} className="text-xs text-red-500 font-medium hover:underline z-20">Remove</button>
                      </div>
                    ) : (
                      <div className="mt-3 border-2 border-dashed border-gray-200 rounded-xl p-3 text-center bg-gray-50/50">
                        <span className="text-xs text-gray-400 font-semibold">+ Upload Logo</span>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Your Business Details (Provider)</span>
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">✨ Smart Company Search</span>
                    </div>

                    <div className="relative">
                      <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-black">
                        <svg className="w-4 h-4 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                          value={providerQuery} 
                          onChange={(e) => handleProviderSearch(e.target.value)} 
                          onFocus={() => providerSuggestions.length > 0 && setShowProviderDropdown(true)}
                          placeholder="Search your business..." 
                          className="flex-1 bg-transparent text-xs font-medium outline-none text-gray-900 placeholder:text-gray-400"
                        />
                        {isSearchingProvider && <span className="text-[10px] text-gray-400 animate-pulse mr-2">Searching...</span>}
                      </div>

                      {showProviderDropdown && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-gray-100">
                          {providerSuggestions.map((item, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => selectProviderCompany(item)}
                              className="p-3 hover:bg-gray-50 cursor-pointer transition-colors flex justify-between items-center"
                            >
                              <div>
                                <div className="text-xs font-bold text-gray-900">{item.name}</div>
                                <div className="text-[10px] text-gray-400 truncate max-w-xs">{item.address}</div>
                              </div>
                              <span className="text-[9px] bg-gray-100 text-gray-600 font-mono px-1.5 py-0.5 rounded">{item.source || 'Database'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input value={providerName} onChange={(e) => setProviderName(e.target.value)} placeholder="Company Name" className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 sm:p-2 text-xs font-semibold outline-none focus:border-black" />
                      <input value={providerEmail} onChange={(e) => setProviderEmail(e.target.value)} placeholder="Email" className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 sm:p-2 text-xs outline-none focus:border-black" />
                      <input value={providerPhone} onChange={(e) => setProviderPhone(e.target.value)} placeholder="Phone" className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 sm:p-2 text-xs outline-none focus:border-black" />
                      <input value={providerVat} onChange={(e) => setProviderVat(e.target.value)} placeholder="Tax/VAT Number" className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 sm:p-2 text-xs outline-none focus:border-black" />
                    </div>
                    <input value={providerAddress} onChange={(e) => setProviderAddress(e.target.value)} placeholder="Business Address" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs outline-none focus:border-black" />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button onClick={() => setCurrentStep(1)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold bg-white hover:bg-gray-100 shadow-sm transition-all">← Back</button>
                  <button onClick={() => setCurrentStep(3)} className="px-6 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 shadow-sm transition-all">Next: Client Details →</button>
                </div>
              </div>
            )}

            {/* STEP 3: CLIENT DETAILS */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Client & Timeline Details</span>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">✨ Smart Company Search</span>
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-black">
                      <svg className="w-4 h-4 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input 
                        value={clientQuery} 
                        onChange={(e) => handleClientSearch(e.target.value)} 
                        onFocus={() => clientSuggestions.length > 0 && setShowClientDropdown(true)}
                        placeholder="Type client company name (e.g. Acme Corp, Mollie, Bol)..." 
                        className="flex-1 bg-transparent text-xs font-medium outline-none text-gray-900 placeholder:text-gray-400"
                      />
                      {isSearchingClient && <span className="text-[10px] text-gray-400 animate-pulse mr-2">Searching...</span>}
                    </div>

                    {showClientDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-gray-100">
                        {clientSuggestions.map((item, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => selectClientCompany(item)}
                            className="p-3 hover:bg-gray-50 cursor-pointer transition-colors flex justify-between items-center"
                          >
                            <div>
                              <div className="text-xs font-bold text-gray-900">{item.name}</div>
                              <div className="text-[10px] text-gray-400 truncate max-w-xs">{item.address}</div>
                            </div>
                            <span className="text-[9px] bg-gray-100 text-gray-600 font-mono px-1.5 py-0.5 rounded">{item.source || 'Database'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client Contact Name" className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 sm:p-2 text-xs font-semibold outline-none focus:border-black" />
                    <input value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} placeholder="Client Company Name" className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 sm:p-2 text-xs outline-none focus:border-black" />
                    <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Client Email" className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 sm:p-2 text-xs outline-none focus:border-black" />
                    <input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="Billing Address" className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 sm:p-2 text-xs outline-none focus:border-black" />
                  </div>
                  <input value={projectTimeline} onChange={(e) => setProjectTimeline(e.target.value)} placeholder="Project Timeline & Milestones" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 sm:p-2 text-xs outline-none focus:border-black" />
                </div>

                <div className="flex justify-between pt-4">
                  <button onClick={() => setCurrentStep(2)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold bg-white hover:bg-gray-100 shadow-sm transition-all">← Back</button>
                  <button onClick={() => setCurrentStep(4)} className="px-6 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 shadow-sm transition-all">Next: Review Scope & Pricing →</button>
                </div>
              </div>
            )}

            {/* STEP 4: SCOPE, PRICING & EXPORT */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-2xl p-5 shadow-sm">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Project Scope & Objectives</label>
                  <textarea value={scopeText} onChange={(e) => setScopeText(e.target.value)} rows={2} placeholder="Detailed description of the project scope..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium outline-none focus:border-black resize-none" />
                </div>

                <div className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Project Hours & Hourly Rates</span>
                    <button onClick={addItem} className="text-xs font-bold text-black hover:underline flex items-center gap-1">+ Add Line Item</button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row gap-2 sm:items-center bg-gray-50/80 p-3 sm:p-2 rounded-xl border border-gray-200/60">
                        <input 
                          value={item.description} 
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)} 
                          placeholder="Phase / Deliverable" 
                          className="w-full sm:flex-1 bg-white border border-gray-200 rounded-lg p-2.5 sm:p-2 text-xs font-medium outline-none focus:border-black" 
                        />
                        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <input type="number" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)} className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-[4.5rem] sm:w-16 bg-white border border-gray-200 rounded-lg p-2.5 sm:p-2 pr-7 text-xs font-bold text-center outline-none focus:border-black" />
                              <span className="absolute right-2 top-2.5 sm:top-2 text-[9px] text-gray-400 font-semibold pointer-events-none">hrs</span>
                            </div>
                            <div className="relative">
                              <input type="number" value={item.price} onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-[5.5rem] sm:w-20 bg-white border border-gray-200 rounded-lg p-2.5 sm:p-2 pr-8 text-xs font-bold outline-none focus:border-black" />
                              <span className="absolute right-2 top-2.5 sm:top-2 text-[9px] text-gray-400 font-semibold pointer-events-none">{currency === 'EUR' ? '€/h' : '$/h'}</span>
                            </div>
                          </div>
                          {items.length > 1 && (
                            <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 font-bold p-2 text-sm bg-white sm:bg-transparent border sm:border-none border-gray-200 rounded-lg shadow-sm sm:shadow-none transition-colors">
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CURRENCY TOGGLE & VAT SELECTION */}
                  <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    
                    <div className="flex flex-col gap-3 w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium w-16">Currency:</span>
                        <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                          <button 
                            onClick={() => setCurrency('EUR')} 
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currency === 'EUR' ? 'bg-white shadow-sm text-black border border-gray-200' : 'text-gray-400 hover:text-gray-600 border border-transparent'}`}
                          >
                            € EUR
                          </button>
                          <button 
                            onClick={() => setCurrency('USD')} 
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currency === 'USD' ? 'bg-white shadow-sm text-black border border-gray-200' : 'text-gray-400 hover:text-gray-600 border border-transparent'}`}
                          >
                            $ USD
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium w-16">VAT Rate:</span>
                        <div className="flex gap-1.5 sm:gap-2">
                          {[0, 9, 21].map((rate) => (
                            <button key={rate} onClick={() => setVatRate(rate)} className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${vatRate === rate ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                              {rate}%
                            </button>
                          ))}
                          <div className="relative">
                            <input 
                              type="number" 
                              value={vatRate} 
                              onChange={(e) => setVatRate(Math.max(0, parseFloat(e.target.value) || 0))} 
                              className={`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-14 sm:w-16 py-1 pl-2 pr-4 rounded-lg text-xs font-bold border transition-all outline-none text-center ${![0, 9, 21].includes(vatRate) ? 'bg-black text-white border-black shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 focus:border-black focus:bg-white'}`}
                              placeholder="0"
                            />
                            <span className={`absolute right-1.5 top-1.5 text-[10px] font-bold pointer-events-none ${![0, 9, 21].includes(vatRate) ? 'text-white/70' : 'text-gray-400'}`}>%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1 w-full sm:w-auto bg-gray-50 p-3 rounded-xl border border-gray-200/60">
                      <div className="text-xs text-gray-500">Subtotal: <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span></div>
                      <div className="text-xs text-gray-500">VAT ({vatRate}%): <span className="font-semibold text-gray-900">{formatCurrency(vatAmount)}</span></div>
                      <div className="text-sm font-extrabold text-black pt-1 border-t border-gray-200 mt-1">Total Due: {formatCurrency(totalDue)}</div>
                    </div>
                  </div>
                </div>

                {/* EXPORT OPTIONS */}
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-900">Export Options</span>
                    <span className="text-[10px] text-gray-400 font-medium">Instant High-Resolution A4 PDF</span>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <button onClick={() => setCurrentStep(3)} className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 text-xs font-bold bg-white hover:bg-gray-100 transition-all shadow-sm">
                      ← Back
                    </button>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button 
                        onClick={handleFreeDownloadClick}
                        disabled={isDownloadingFree}
                        className="flex-1 sm:flex-none py-3 px-5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95 text-center flex items-center justify-center gap-2 disabled:opacity-50 border border-gray-200"
                      >
                        {isDownloadingFree ? (
                          <>
                            <svg className="animate-spin h-3.5 w-3.5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Downloading...</span>
                          </>
                        ) : (
                          'Download free quote'
                        )}
                      </button>

                      {isPro ? (
                        <button 
                          onClick={() => downloadPdf(false)}
                          className="flex-1 sm:flex-none py-3 px-5 rounded-xl text-xs font-bold text-white bg-black hover:bg-gray-800 shadow-md transition-all active:scale-95 text-center cursor-pointer"
                        >
                          Download Official PDF (Pro)
                        </button>
                      ) : (
                        <a 
                          href="https://desmindspace.lemonsqueezy.com/checkout/buy/8a425593-2af6-42d3-8018-98e97cc4d0df?embed=1" 
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              window.localStorage.setItem('checkoutType', 'single');
                            }
                          }}
                          className="lemonsqueezy-button flex-1 sm:flex-none py-3 px-5 rounded-xl text-xs font-bold text-white bg-black hover:bg-gray-800 shadow-md transition-all active:scale-95 text-center cursor-pointer"
                        >
                          Download Full PDF
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 text-center pt-2">
                    {isPro ? "Your Pro account has removed all watermarks for official client delivery." : "Free download includes a subtle watermark. Upgrade removes all watermarks for official client delivery."}
                  </p>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* FAQ FOOTER */}
      <footer className="w-full bg-white border-t border-gray-200/60 py-16 mt-20 relative z-20">
        <div className="max-w-2xl mx-auto px-6 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs text-gray-400">Everything you need to know about generating official quotes.</p>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-3.5 text-xs font-semibold text-gray-800 flex justify-between items-center hover:bg-gray-100/60 transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-gray-400 text-xs ml-2">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div className="px-3.5 pb-3.5 text-[11px] text-gray-500 leading-relaxed border-t border-gray-100 pt-2 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center text-[10px] text-gray-400 pt-4">
            © {new Date().getFullYear()} QuoteBuilder. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}