'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import Script from 'next/script';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

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
    if (!prompt.trim()) return;
    setIsLoading(true);
    setIsGenerated(false);

    // Simuleer verwerking
    setTimeout(() => {
      setIsLoading(false);
      setIsGenerated(true);
    }, 1200);
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
      const payload = { prompt, logo, isWatermarked };
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
      <main className="max-w-3xl mx-auto pt-24 px-6">
        
        {/* TITLE SECTION */}
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
            Your idea to a functional quote in seconds.
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto font-normal">
            Describe your project or service requirement below and generate an official, ready-to-send PDF quote instantly.
          </p>
        </div>

        {/* SEARCH / PROMPT BAR */}
        <div className="relative mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-lg hover:border-gray-300 transition-all flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            
            <input 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g. Website development for a law firm including SEO optimization..." 
              className="w-full bg-transparent text-sm sm:text-base outline-none text-gray-900 placeholder:text-gray-400 font-medium"
            />

            <button 
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-black hover:bg-gray-800 disabled:opacity-40 transition-all active:scale-95 flex-shrink-0"
            >
              Generate
            </button>
          </div>
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
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10 animate-fade-in">
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

        {/* LOGO UPLOAD BOX */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:border-gray-300 transition-all relative overflow-hidden flex flex-col justify-between min-h-[140px]">
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
            <div className="mt-4 border-2 border-dashed border-gray-200 rounded-xl p-3 text-center bg-gray-50/50">
              <span className="text-xs text-gray-400 font-semibold">+ Upload Logo</span>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}