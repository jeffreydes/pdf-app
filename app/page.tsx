'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import Script from 'next/script';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

  // Form Fields (Pre-fillable)
  const [clientName, setClientName] = useState('Valued Client');
  const [clientMeta, setClientMeta] = useState('Requested via Quote Generator');
  const [providerName, setProviderName] = useState('Your Company Name');
  const [providerEmail, setProviderEmail] = useState('contact@yourcompany.com');
  const [scopeText, setScopeText] = useState('');
  const [item1Price, setItem1Price] = useState('2450');
  const [item2Price, setItem2Price] = useState('500');
  const [vatRate, setVatRate] = useState('21');

  // Lemon Squeezy Init
  const handleLemonSqueezyScriptLoad = () => {
    if (typeof window !== 'undefined' && (window as any).createLemonSqueezy) {
      (window as any).createLemonSqueezy();
      (window as any).LemonSqueezy?.Setup({
        eventHandler: (event: any) => {
          if (event.event === 'Checkout.Success') {
            setHasPaid(true);
          }
        }
      });
    }
  };

  useEffect(() => {
    if (hasPaid) {
      downloadPdf(false);
      setHasPaid(false);
    }
  }, [hasPaid]);

  const handleGenerate = () => {
    if (!prompt.trim() && !scopeText.trim()) return;
    setIsLoading(true);
    setIsGenerated(false);

    // Sync prompt into scope if scope is empty
    if (!scopeText) {
      setScopeText(prompt);
    }

    setTimeout(() => {
      setIsLoading(false);
      setIsGenerated(true);
    }, 1000);
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') setLogo(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const downloadPdf = async (isWatermarked: boolean) => {
    try {
      const payload = {
        prompt,
        logo,
        clientName,
        clientMeta,
        providerName,
        providerEmail,
        scopeText: scopeText || prompt,
        item1Price,
        item2Price,
        vatRate,
        isWatermarked
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
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111827] font-sans antialiased selection:bg-black selection:text-white pb-24">
      
      <Script 
        src="https://assets.lemonsqueezy.com/lemon.js" 
        strategy="afterInteractive"
        onReady={handleLemonSqueezyScriptLoad}
      />

      {/* TOP NAVBAR */}
      <header className="bg-white border-b border-gray-200/80 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white font-black text-xs">Q</div>
          <span className="font-bold text-sm tracking-tight text-gray-900">QuoteBuilder</span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-3xl mx-auto pt-16 px-6">
        
        {/* TITLE SECTION */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
            Your idea to a functional quote in seconds.
          </h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Fill in the details below or prompt your idea to customize your official PDF quote.
          </p>
        </div>

        {/* PROMPT SEARCH BAR */}
        <div className="relative mb-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-lg hover:border-gray-300 transition-all flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            
            <input 
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setScopeText(e.target.value);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g. Logo design for an architect..." 
              className="w-full bg-transparent text-sm sm:text-base outline-none text-gray-900 placeholder:text-gray-400 font-medium"
            />

            <button 
              onClick={handleGenerate}
              disabled={isLoading || (!prompt.trim() && !scopeText.trim())}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-black hover:bg-gray-800 disabled:opacity-40 transition-all active:scale-95 flex-shrink-0"
            >
              Generate
            </button>
          </div>
        </div>

        {/* EDITABLE QUOTE FORM FIELDS */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm mb-8 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">
            Quote Information Fields
          </h2>

          {/* PREPARED FOR & PREPARED BY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-600 uppercase">Prepared For (Client)</label>
              <input 
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client Name"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-black"
              />
              <input 
                value={clientMeta}
                onChange={(e) => setClientMeta(e.target.value)}
                placeholder="Client Sub-note / Email"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-medium text-gray-500 outline-none focus:border-black"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-600 uppercase">Prepared By (Provider)</label>
              <input 
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="Your Company Name"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-black"
              />
              <input 
                value={providerEmail}
                onChange={(e) => setProviderEmail(e.target.value)}
                placeholder="Provider Email"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-medium text-gray-500 outline-none focus:border-black"
              />
            </div>
          </div>

          {/* SCOPE TEXT */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Project Scope & Objectives</label>
            <textarea 
              value={scopeText}
              onChange={(e) => setScopeText(e.target.value)}
              rows={2}
              placeholder="Detailed description of the project scope..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium outline-none focus:border-black resize-none"
            />
          </div>

          {/* PRICING & VAT */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Deliverables (€)</label>
              <input 
                type="number"
                value={item1Price}
                onChange={(e) => setItem1Price(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">QA & Testing (€)</label>
              <input 
                type="number"
                value={item2Price}
                onChange={(e) => setItem2Price(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">VAT Rate (%)</label>
              <input 
                type="number"
                value={vatRate}
                onChange={(e) => setVatRate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* LOGO UPLOAD BOX */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm mb-8 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Company Logo (Optional)</span>
            <p className="text-xs text-gray-500">Drag & drop your logo file or click to select</p>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleLogoUpload}
            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
          />

          {logo ? (
            <div className="mt-4 flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <img src={logo} alt="Logo" className="h-8 max-w-[120px] object-contain" />
              <button onClick={(e) => { e.stopPropagation(); setLogo(null); }} className="text-xs text-red-500 font-medium hover:underline z-20">Remove</button>
            </div>
          ) : (
            <div className="mt-3 border-2 border-dashed border-gray-200 rounded-xl p-3 text-center bg-gray-50/50">
              <span className="text-xs text-gray-400 font-semibold">+ Upload Logo</span>
            </div>
          )}
        </div>

        {/* LOADING STATE OR GENERATED BUTTONS */}
        {isLoading && (
          <div className="flex justify-center items-center py-6 mb-8 gap-3 text-gray-500 text-sm font-medium">
            <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating official quote structure...
          </div>
        )}

        {isGenerated && !isLoading && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
            <button 
              onClick={() => downloadPdf(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm transition-all active:scale-95"
            >
              Preview your Quote
            </button>

            <a 
              href="https://desmindspace.lemonsqueezy.com/checkout/buy/8a425593-2af6-42d3-8018-98e97cc4d0df?embed=1" 
              className="lemonsqueezy-button w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold text-white bg-black hover:bg-gray-800 shadow-md transition-all active:scale-95 text-center cursor-pointer"
            >
              Download full quote
            </a>
          </div>
        )}

      </main>
    </div>
  );
}