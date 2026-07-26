'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import Script from 'next/script';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  // Proposal State Data
  const [mainTitle, setMainTitle] = useState('Offerte');
  const [subTitle, setSubTitle] = useState('Webontwikkeling & UI Design\nVoor Client Inc.');
  const [introText, setIntroText] = useState('Wij bieden een complete oplossing voor uw digitale transformatie met moderne webtechnologieën.');
  const [text, setText] = useState(`# Investeringsoverzicht\n\n## Projectfases\n\n- Phase 1: UX/UI Design & Prototyping\n- Phase 2: Next.js Frontend Development\n- Phase 3: Deployment & Testing\n\n[PRICE] Totale Investering : € 4.500,-`);
  
  const [accentColor, setAccentColor] = useState('#007AFF');
  const [columns, setColumns] = useState<number>(2);
  const [logo, setLogo] = useState<string | null>(null);

  const colors = [
    { name: 'Apple Blue', hex: '#007AFF' },
    { name: 'Midnight', hex: '#1C1C1E' },
    { name: 'Emerald', hex: '#34C759' },
    { name: 'Sunset', hex: '#FF9500' },
    { name: 'Purple', hex: '#AF52DE' },
  ];

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
      generateDocument(false);
      setHasPaid(false);
    }
  }, [hasPaid]);

  // AI Generator Simulator / Parser
  const handleAiGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      setMainTitle('Offerte');
      setSubTitle(`Op maat gemaakt voor:\n${prompt.slice(0, 30)}...`);
      setIntroText(`Naar aanleiding van uw aanvraag voor "${prompt}" hebben wij deze op maat gemaakte offerte samengesteld. Hierin vindt u de voorwaarden en investering.`);
      setText(`# Specificaties & Investering\n\n## Overzicht van Werkzaamheden\n\n- Analyse & Strategie : Inbegrepen\n- Uitvoering & Oplevering : Volgens planning\n- Support & Garantie : 30 dagen kostenloos\n\n[PRICE] Totaalprijs : € 2.950,-`);
      setIsGenerating(false);
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

  const generateDocument = async (isWatermarked: boolean) => {
    setIsGenerating(true);
    try {
      const payload = { mainTitle, subTitle, introText, text, logo, accentColor, columns, isWatermarked };
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Generatie mislukt');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = isWatermarked ? 'Draft_Preview.pdf' : 'Offerte_Final.pdf';
      a.click();
    } catch (error: any) {
      alert('Fout: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans antialiased selection:bg-blue-500 selection:text-white pb-20">
      
      <Script 
        src="https://assets.lemonsqueezy.com/lemon.js" 
        strategy="afterInteractive"
        onReady={handleLemonSqueezyScriptLoad}
      />

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-black/5 px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-3">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/10" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/10" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-black/80">PDF Studio</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => generateDocument(true)}
            disabled={isGenerating}
            className="px-4 py-1.5 rounded-full text-xs font-medium bg-black/5 hover:bg-black/10 text-black/80 transition-all active:scale-95"
          >
            {isGenerating ? 'Laden...' : 'Preview PDF'}
          </button>
          
          <a 
            href="https://desmindspace.lemonsqueezy.com/checkout/buy/8a425593-2af6-42d3-8018-98e97cc4d0df?embed=1" 
            className="lemonsqueezy-button px-4 py-1.5 rounded-full text-xs font-semibold bg-[#007AFF] hover:bg-[#0066CC] text-white shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            Download High-Res
          </a>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto pt-16 px-6">
        
        {/* HERO PROMPT SECTION */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black/90 mb-3">
            Typ je idee. Ontvang je offerte.
          </h1>
          <p className="text-base text-black/50 font-normal max-w-lg mx-auto">
            Beschrijf kort wat je aanbiedt. Onze AI stelt binnen enkele seconden een strak gedocumenteerde PDF voor je samen.
          </p>
        </div>

        {/* MACOS APPLE CHATBAR */}
        <div className="relative bg-white/80 backdrop-blur-xl border border-black/10 rounded-2xl shadow-2xl p-2 transition-all focus-within:ring-4 focus-within:ring-blue-500/20 mb-8">
          <div className="flex items-center gap-3 px-3 py-2">
            <svg className="w-5 h-5 text-black/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <input 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
              placeholder="Bijv: Offerte voor een Next.js webshop inclusief SEO voor €3.500,-..." 
              className="w-full bg-transparent text-sm sm:text-base outline-none placeholder:text-black/30 text-black/90"
            />
            <button 
              onClick={handleAiGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="bg-[#007AFF] hover:bg-[#0062CC] disabled:opacity-30 text-white p-2.5 rounded-xl transition-all shadow-md active:scale-90 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* BENTO INFO BOXES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          {/* DRAG & DROP LOGO BOX */}
          <div className="bg-white/60 backdrop-blur-md border border-black/5 rounded-2xl p-5 hover:border-black/10 transition-all flex flex-col justify-between relative group cursor-pointer overflow-hidden min-h-[140px]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-black/40 block mb-1">Bedrijfslogo</span>
              <p className="text-xs text-black/60">Sleep je logo hierheen of klik om te uploaden</p>
            </div>
            
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleLogoUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
            />

            {logo ? (
              <div className="mt-3 flex items-center justify-between bg-black/5 p-2 rounded-xl">
                <img src={logo} alt="Logo" className="h-8 max-w-[100px] object-contain" />
                <button onClick={(e) => { e.stopPropagation(); setLogo(null); }} className="text-xs text-red-500 font-medium hover:underline z-20">Verwijder</button>
              </div>
            ) : (
              <div className="mt-3 border-2 border-dashed border-black/10 rounded-xl p-3 text-center group-hover:border-black/20 transition-all">
                <span className="text-xs text-black/40 font-medium">+ Upload Logo</span>
              </div>
            )}
          </div>

          {/* COLOR SELECTOR BOX */}
          <div className="bg-white/60 backdrop-blur-md border border-black/5 rounded-2xl p-5 hover:border-black/10 transition-all flex flex-col justify-between min-h-[140px]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-black/40 block mb-1">Accent Stijl</span>
              <p className="text-xs text-black/60">Kies de merk-kleur voor de PDF headers</p>
            </div>
            
            <div className="flex gap-2 mt-3">
              {colors.map(c => (
                <button 
                  key={c.hex} 
                  onClick={() => setAccentColor(c.hex)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${accentColor === c.hex ? 'border-black scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
                />
              ))}
            </div>
          </div>

          {/* LAYOUT OPTIONS BOX */}
          <div className="bg-white/60 backdrop-blur-md border border-black/5 rounded-2xl p-5 hover:border-black/10 transition-all flex flex-col justify-between min-h-[140px]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-black/40 block mb-1">Pagina Layout</span>
              <p className="text-xs text-black/60">Aantal kolommen voor inhoud</p>
            </div>
            
            <div className="flex gap-2 mt-3">
              {[1, 2].map(num => (
                <button 
                  key={num}
                  onClick={() => setColumns(num)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all ${columns === num ? 'bg-black text-white border-black' : 'bg-white text-black/60 border-black/10 hover:bg-black/5'}`}
                >
                  {num} {num === 1 ? 'Kolom' : 'Kolommen'}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* EDITABLE PREVIEW CONTENT */}
        <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-black/5">
            <span className="text-xs font-semibold uppercase tracking-wider text-black/40">Gegenereerde Concept Tekst</span>
            <span className="text-xs text-black/30">Direct aanpasbaar</span>
          </div>
          
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="w-full bg-transparent font-mono text-xs sm:text-sm text-black/80 leading-relaxed outline-none resize-none"
          />
        </div>

      </main>
    </div>
  );
}