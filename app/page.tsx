'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import Script from 'next/script';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  // Proposal State Data
  const [mainTitle, setMainTitle] = useState('Offerte');
  const [subTitle, setSubTitle] = useState('Design & Development Proposal\nVoor Client Inc.');
  const [introText, setIntroText] = useState('Wij bieden een complete premium oplossing voor uw digitale transformatie met Liquid Glass Next.js technologie.');
  const [text, setText] = useState(`# Investeringsoverzicht\n\n## Projectfases\n\n- Phase 1: UX/UI Design & Prototyping\n- Phase 2: Next.js Frontend Development\n- Phase 3: Deployment & Testing\n\n[PRICE] Totale Investering : € 4.500,-`);
  
  const [accentColor, setAccentColor] = useState('#A855F7');
  const [columns, setColumns] = useState<number>(2);
  const [logo, setLogo] = useState<string | null>(null);

  const colors = [
    { name: 'Liquid Violet', hex: '#A855F7' },
    { name: 'Deep Indigo', hex: '#6366F1' },
    { name: 'Ocean Cyan', hex: '#06B6D4' },
    { name: 'Rose Glow', hex: '#EC4899' },
    { name: 'Pure White', hex: '#FFFFFF' },
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

  const handleAiGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      setMainTitle('Offerte');
      setSubTitle(`Op maat gemaakt voor:\n${prompt.slice(0, 35)}...`);
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
    <div className="relative min-h-screen bg-[#06040A] text-white font-sans antialiased overflow-hidden selection:bg-purple-500 selection:text-white pb-24">
      
      {/* BACKGROUND LIQUID ORGANIC SHAPES (Met paarse ambient glow zoals op ref foto) */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-purple-900/40 via-purple-600/20 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-fuchsia-900/30 via-indigo-900/20 to-transparent blur-[140px] pointer-events-none" />
      
      {/* BACKGROUND WAVE CURVES (Sfeer van de foto) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none" />

      <Script 
        src="https://assets.lemonsqueezy.com/lemon.js" 
        strategy="afterInteractive"
        onReady={handleLemonSqueezyScriptLoad}
      />

      {/* TOP NAVIGATION BAR - Glass Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/[0.03] border-b border-white/[0.08] px-8 py-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-400 p-[1px] shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-[#0B0813] rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-purple-300">LG</span>
            </div>
          </div>
          <span className="font-semibold text-sm tracking-wide text-white/90">Liquid Glass Studio</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => generateDocument(true)}
            disabled={isGenerating}
            className="px-5 py-2 rounded-full text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] text-white/80 border border-white/[0.1] backdrop-blur-md transition-all active:scale-95 shadow-lg"
          >
            {isGenerating ? 'Laden...' : 'Preview PDF'}
          </button>
          
          {/* LIQUID GLASS BUTTON (Zoals de "Try the glass" button uit de foto) */}
          <a 
            href="https://desmindspace.lemonsqueezy.com/checkout/buy/8a425593-2af6-42d3-8018-98e97cc4d0df?embed=1" 
            className="lemonsqueezy-button relative group px-6 py-2 rounded-full text-xs font-semibold text-white backdrop-blur-xl bg-gradient-to-r from-purple-500/30 via-fuchsia-500/20 to-purple-500/30 border border-white/30 shadow-[0_8px_32px_rgba(168,85,247,0.3)] hover:shadow-[0_12px_40px_rgba(168,85,247,0.5)] transition-all duration-300 active:scale-95 overflow-hidden cursor-pointer inline-block"
          >
            {/* Liquid Highlight bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span className="relative z-10 flex items-center gap-2">
              Download High-Res
            </span>
          </a>
        </div>
      </header>

      {/* MAIN CONTENT HERO SECTION */}
      <main className="relative z-10 max-w-4xl mx-auto pt-20 px-6">
        
        {/* TITEL COMPOSITIE (Gekopieerd qua grootte, gewicht & stijl uit referentiefoto) */}
        <div className="text-center mb-10 space-y-4">
          <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
            Liquid Glass
          </h1>
          <p className="text-base sm:text-xl text-purple-200/60 font-light max-w-md mx-auto leading-relaxed">
            A frosted blur layer you can prompt, explore, and reuse in any offer layout.
          </p>
        </div>

        {/* CHATBAR - CAPSULE LIQUID GLASS PILL */}
        <div className="relative mb-12">
          <div className="relative group bg-white/[0.04] backdrop-blur-2xl border border-white/20 rounded-full p-2 shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_20px_50px_rgba(168,85,247,0.25)]">
            {/* Top speculaire glazen rand */}
            <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            
            <div className="flex items-center gap-3 px-4 py-1">
              <svg className="w-5 h-5 text-purple-400/70 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              
              <input 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                placeholder="Type your idea for your offer..." 
                className="w-full bg-transparent text-sm sm:text-base outline-none placeholder:text-white/30 text-white font-light tracking-wide"
              />

              {/* GENERATE CAPSULE BUTTON (Exact de 'Try the glass' stijl uit de foto) */}
              <button 
                onClick={handleAiGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="relative px-6 py-3 rounded-full text-xs font-semibold text-white backdrop-blur-xl bg-gradient-to-r from-purple-600/40 via-fuchsia-500/30 to-purple-600/40 border border-white/30 shadow-[0_4px_20px_rgba(168,85,247,0.4)] hover:shadow-[0_6px_25px_rgba(168,85,247,0.6)] disabled:opacity-30 transition-all active:scale-95 flex-shrink-0"
              >
                <div className="absolute inset-0 bg-white/10 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
                <span className="relative z-10">Generate</span>
              </button>
            </div>
          </div>
        </div>

        {/* BENTO INFO BOXES - FROSTED LIQUID CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          
          {/* LOGO DRAG & DROP BOX */}
          <div className="relative group bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-purple-500/40 hover:bg-white/[0.05] transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300/60 block mb-1">Company Logo</span>
              <p className="text-xs text-white/50 font-light">Drag & drop your logo file or click</p>
            </div>
            
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleLogoUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
            />

            {logo ? (
              <div className="mt-3 flex items-center justify-between bg-white/10 p-2.5 rounded-2xl border border-white/10">
                <img src={logo} alt="Logo" className="h-7 max-w-[100px] object-contain" />
                <button onClick={(e) => { e.stopPropagation(); setLogo(null); }} className="text-xs text-rose-400 font-medium hover:underline z-20">Remove</button>
              </div>
            ) : (
              <div className="mt-4 border border-dashed border-white/20 rounded-2xl p-3 text-center group-hover:border-purple-400/40 transition-all bg-white/[0.02]">
                <span className="text-xs text-white/40 font-medium">+ Upload Logo</span>
              </div>
            )}
          </div>

          {/* ACCENT STIJL SELECTOR */}
          <div className="relative group bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-purple-500/40 hover:bg-white/[0.05] transition-all duration-300 shadow-xl flex flex-col justify-between min-h-[160px]">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300/60 block mb-1">Accent Theme</span>
              <p className="text-xs text-white/50 font-light">Select liquid accent highlights</p>
            </div>
            
            <div className="flex gap-2.5 mt-4">
              {colors.map(c => (
                <button 
                  key={c.hex} 
                  onClick={() => setAccentColor(c.hex)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-7 h-7 rounded-full border border-white/30 transition-all duration-300 ${accentColor === c.hex ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-black scale-110 shadow-[0_0_15px_rgba(168,85,247,0.8)]' : 'hover:scale-105 opacity-70 hover:opacity-100'}`}
                />
              ))}
            </div>
          </div>

          {/* LAYOUT CAPSULE SELECTOR */}
          <div className="relative group bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-purple-500/40 hover:bg-white/[0.05] transition-all duration-300 shadow-xl flex flex-col justify-between min-h-[160px]">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300/60 block mb-1">Layout Grid</span>
              <p className="text-xs text-white/50 font-light">Choose pdf inner columns</p>
            </div>
            
            <div className="flex gap-2 mt-4">
              {[1, 2].map(num => (
                <button 
                  key={num}
                  onClick={() => setColumns(num)}
                  className={`px-4 py-2 rounded-full text-xs font-medium border transition-all duration-300 ${columns === num ? 'bg-gradient-to-r from-purple-600/50 to-fuchsia-600/50 border-white/40 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-white/[0.03] border-white/10 text-white/50 hover:bg-white/[0.08]'}`}
                >
                  {num} {num === 1 ? 'Column' : 'Columns'}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* EDITABLE LIQUID TEXTAREA CONTAINER */}
        <div className="relative bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300/60">Generated Offer Text</span>
            <span className="text-xs text-white/30 font-light">Fully Editable</span>
          </div>
          
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="w-full bg-transparent font-mono text-xs sm:text-sm text-purple-100/80 leading-relaxed outline-none resize-none placeholder:text-white/20"
          />
        </div>

      </main>
    </div>
  );
}