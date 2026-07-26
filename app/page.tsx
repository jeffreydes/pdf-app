'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import Script from 'next/script';

interface LineItem {
  id: string;
  description: string;
  qty: number;
  price: number;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

  // Form Fields
  const [clientName, setClientName] = useState('Valued Client');
  const [clientMeta, setClientMeta] = useState('Requested via Quote Generator');
  const [providerName, setProviderName] = useState('Your Company Name');
  const [providerEmail, setProviderEmail] = useState('contact@yourcompany.com');
  const [scopeText, setScopeText] = useState('');
  const [vatRate, setVatRate] = useState<number>(21);

  // Dynamic Line Items
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: 'Scope Execution & Deliverables', qty: 1, price: 2450 },
    { id: '2', description: 'Quality Assurance & Testing', qty: 1, price: 500 }
  ]);

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const vatAmount = subtotal * (vatRate / 100);
  const totalDue = subtotal + vatAmount;

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

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

    if (!scopeText) {
      setScopeText(prompt);
    }

    setTimeout(() => {
      setIsLoading(false);
      setIsGenerated(true);
    }, 1000);
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: 'New Service Item',
      qty: 1,
      price: 250
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
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
        items,
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
    <div className="min-h-screen bg-[#F8F9FA] text-[#111827] font-sans antialiased selection:bg-black selection:text-white pb-32">
      
      <Script 
        src="https://assets.lemonsqueezy.com/lemon.js" 
        strategy="afterInteractive"
        onReady={handleLemonSqueezyScriptLoad}
      />

      {/* HEADER */}
      <header className="bg-white border-b border-gray-200/80 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white font-black text-xs">Q</div>
          <span className="font-bold text-sm tracking-tight text-gray-900">QuoteBuilder</span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-3xl mx-auto pt-12 px-6">
        
        {/* HERO TITLE */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
            Your idea to a functional quote in seconds.
          </h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Describe your project or customize the fields below to construct your official quote.
          </p>
        </div>

        {/* PROMPT SEARCH BAR */}
        <div className="relative mb-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-lg hover:border-gray-300 transition-all flex items-center gap-3 focus-within:ring-2 focus-within:ring-black">
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
              {isLoading ? 'Processing...' : 'Generate'}
            </button>
          </div>
        </div>

        {/* BENTO GRID: CARD 1 (BRAND & LOGO) & CARD 2 (CLIENT & PROVIDER) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          {/* CARD 1: LOGO */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Brand Logo</span>
              <p className="text-xs text-gray-500">Drag & drop or click</p>
            </div>
            
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleLogoUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
            />

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

          {/* CARD 2: CLIENT & PROVIDER */}
          <div className="md:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Parties Information</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Prepared For (Client)</label>
                <input 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Client Name"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs font-semibold outline-none focus:border-black"
                />
                <input 
                  value={clientMeta}
                  onChange={(e) => setClientMeta(e.target.value)}
                  placeholder="Client Note / Subtitle"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs text-gray-500 outline-none focus:border-black"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Prepared By (Provider)</label>
                <input 
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="Your Company Name"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs font-semibold outline-none focus:border-black"
                />
                <input 
                  value={providerEmail}
                  onChange={(e) => setProviderEmail(e.target.value)}
                  placeholder="Provider Email"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs text-gray-500 outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

        </div>

        {/* CARD 3: SCOPE TEXT */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm mb-6">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Project Scope & Objectives</label>
          <textarea 
            value={scopeText}
            onChange={(e) => setScopeText(e.target.value)}
            rows={2}
            placeholder="Detailed description of the project scope..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium outline-none focus:border-black resize-none"
          />
        </div>

        {/* CARD 4: DYNAMIC LINE ITEMS & TOTALS */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm mb-8 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Deliverables & Pricing</span>
            <button 
              onClick={addItem}
              className="text-xs font-bold text-black hover:underline flex items-center gap-1"
            >
              + Add Line Item
            </button>
          </div>

          {/* DYNAMIC ITEMS LIST */}
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-2 items-center bg-gray-50/80 p-2 rounded-xl border border-gray-200/60">
                <input 
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  placeholder="Item Description"
                  className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-xs font-medium outline-none focus:border-black"
                />
                <input 
                  type="number"
                  value={item.qty}
                  onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                  placeholder="Qty"
                  className="w-14 bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold text-center outline-none focus:border-black"
                />
                <input 
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                  placeholder="Price"
                  className="w-24 bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-black"
                />
                {items.length > 1 && (
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 font-bold px-2 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* VAT SELECTOR & TOTALS */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">VAT Rate:</span>
              {[0, 9, 21].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setVatRate(rate)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${vatRate === rate ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                >
                  {rate}%
                </button>
              ))}
            </div>

            <div className="text-right space-y-1 w-full sm:w-auto bg-gray-50 p-3 rounded-xl border border-gray-200/60">
              <div className="text-xs text-gray-500">Subtotal: <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span></div>
              <div className="text-xs text-gray-500">VAT ({vatRate}%): <span className="font-semibold text-gray-900">{formatCurrency(vatAmount)}</span></div>
              <div className="text-sm font-extrabold text-black pt-1 border-t border-gray-200">Total Due: {formatCurrency(totalDue)}</div>
            </div>
          </div>
        </div>

      </main>

      {/* STICKY BOTTOM ACTION BAR */}
      {isGenerated && (
        <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-6">
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200/80 p-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md w-full justify-between animate-fade-in">
            <button 
              onClick={() => downloadPdf(true)}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95 text-center"
            >
              Preview Draft
            </button>

            <a 
              href="https://desmindspace.lemonsqueezy.com/checkout/buy/8a425593-2af6-42d3-8018-98e97cc4d0df?embed=1" 
              className="lemonsqueezy-button flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-black hover:bg-gray-800 shadow-md transition-all active:scale-95 text-center cursor-pointer"
            >
              Download Full PDF
            </a>
          </div>
        </div>
      )}

    </div>
  );
}