'use client';
import { useState, ChangeEvent, useEffect } from 'react';
import Script from 'next/script';

export default function Home() {
  // --- COVER PAGE DATA ---
  const [mainTitle, setMainTitle] = useState('Proposal');
  const [subTitle, setSubTitle] = useState('Design Proposal\nfor Customer Majestro Ltd.');
  const [introText, setIntroText] = useState('We work with one of the most successful companies in the last years. Find out what is the difference between us and our market competitors.');
  
  const [images, setImages] = useState<string[]>([]);
  const [customFont, setCustomFont] = useState<string | null>(null);
  const [fontName, setFontName] = useState<string>('');
  const [accentColor, setAccentColor] = useState('#E31837');
  const [columns, setColumns] = useState<number>(2);

  const [text, setText] = useState(`# Project offer.\n\n## We offer.\n\nWe have established that a comprehensive design schedule based on consideration of your needs.\n\n- Design of two logo concepts to choose from\n- Design of a visual identity from chosen logo\n- Design of new corporate print material\n\n[PRICE] Design Phase: $2.499*\n[PRICE] Development Phase: $3.499*`);

  const [isGenerating, setIsGenerating] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  const colors = [
    { name: 'Red', hex: '#E31837' }, { name: 'Blue', hex: '#0a66c2' },
    { name: 'Black', hex: '#111111' }, { name: 'Yellow', hex: '#FACC15' }, { name: 'Grey', hex: '#D1D5DB' },
  ];

  // --- LEMON SQUEEZY INITIALISATIE ---
  const handleLemonSqueezyScriptLoad = () => {
    if (typeof window !== 'undefined' && (window as any).createLemonSqueezy) {
      (window as any).createLemonSqueezy();
      
      // Koppel de event handler aan de Lemon Squeezy instantie
      (window as any).LemonSqueezy?.Setup({
        eventHandler: (event: any) => {
          if (event.event === 'Checkout.Success') {
            setHasPaid(true); // Triggert de download useEffect
          }
        }
      });
    }
  };

  // Triggert volautomatisch de schone PDF zodra er succesvol betaald is
  useEffect(() => {
    if (hasPaid) {
      generateDocument(false);
      setHasPaid(false); // Reset status
    }
  }, [hasPaid]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 2 - images.length);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => { if (typeof reader.result === 'string') setImages(prev => [...prev, reader.result as string]); };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

  const handleFontUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setFontName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => { if (typeof reader.result === 'string') setCustomFont(reader.result); };
    reader.readAsDataURL(file);
  };

  const removeFont = () => { setCustomFont(null); setFontName(''); };

  // --- PDF GENERATOR LOGICA ---
  const generateDocument = async (isWatermarked: boolean) => {
    setIsGenerating(true);
    try {
      const payload = { mainTitle, subTitle, introText, text, images, customFont, accentColor, columns, isWatermarked };
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
      a.download = isWatermarked ? 'Draft_Preview.pdf' : 'PDF_Pro_Final.pdf';
      a.click();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 font-sans pb-32">
      
      {/* Inject Lemon Squeezy Script in Next.js & Run Init op Ready */}
      <Script 
        src="https://assets.lemonsqueezy.com/lemon.js" 
        strategy="afterInteractive"
        onReady={handleLemonSqueezyScriptLoad}
      />

      {/* HEADER */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="font-black text-xl tracking-tight uppercase">PDF<span className="font-light text-zinc-400">builder</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => generateDocument(true)} 
              disabled={isGenerating} 
              className="px-6 py-2.5 border-2 border-zinc-200 font-bold text-sm bg-white text-zinc-700 uppercase tracking-widest hover:bg-zinc-50 transition-colors"
            >
              {isGenerating ? 'Rendering...' : 'Preview PDF'}
            </button>
            
            {/* LEMON SQUEEZY BUTTON OVERLAY */}
            <a 
              href="https://desmindspace.lemonsqueezy.com/checkout/buy/8a425593-2af6-42d3-8018-98e97cc4d0df?embed=1" 
              className="lemonsqueezy-button px-6 py-3 font-bold text-sm bg-black text-white uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-lg inline-block cursor-pointer"
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT: COVER PAGE BUILDER */}
        <div className="col-span-1 lg:col-span-5 space-y-8">
          
          <div className="bg-white p-6 border-t-4 border-black shadow-sm">
            <h2 className="font-black uppercase tracking-widest text-xs mb-4 text-zinc-400">Design Assets</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase mb-2">Accent Color</label>
                <div className="flex gap-2">
                  {colors.map(c => (
                    <button key={c.hex} onClick={() => setAccentColor(c.hex)} style={{ backgroundColor: c.hex }} className={`w-8 h-8 rounded-full border-2 ${accentColor === c.hex ? 'border-zinc-900 ring-2 ring-zinc-300 scale-110' : 'border-zinc-200'} transition-all`} title={c.name} />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase mb-2">Columns</label>
                <div className="flex gap-2">
                  {[1, 2].map(num => (
                    <button key={num} onClick={() => setColumns(num)} className={`w-10 h-8 rounded border font-bold text-sm transition-all ${columns === num ? 'border-black bg-black text-white' : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'}`}>
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase mb-2">Custom Font (.ttf, .otf, .woff)</label>
              {customFont ? (
                <div className="flex justify-between items-center bg-zinc-50 border border-zinc-200 p-3 rounded">
                  <span className="text-sm font-semibold truncate">{fontName}</span>
                  <button onClick={removeFont} className="text-red-500 font-bold text-xs uppercase hover:underline">Remove</button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-zinc-300 p-4 text-center hover:bg-zinc-50 transition-colors relative cursor-pointer">
                  <input type="file" accept=".ttf,.otf,.woff,.woff2" onChange={handleFontUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <span className="text-xs font-semibold text-zinc-500">Drag & Drop Font File</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-2">Images (Max 2)</label>
              <div className="border-2 border-dashed border-zinc-300 p-4 text-center hover:bg-zinc-50 transition-colors relative cursor-pointer mb-3">
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={images.length >= 2} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <span className="text-xs font-semibold text-zinc-500">{images.length >= 2 ? 'Limit Reached' : 'Drag & Drop Images'}</span>
              </div>
              {images.length > 0 && (
                <div className="flex gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 border border-zinc-200">
                      <img src={img} className="w-full h-full object-cover" alt="upload" />
                      <button onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs font-bold">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 border-t-4 border-black shadow-sm">
            <h2 className="font-black uppercase tracking-widest text-xs mb-6 text-zinc-400">Cover Details</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase mb-2">Main Title</label>
                <input value={mainTitle} onChange={e => setMainTitle(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 p-3 font-black text-2xl uppercase tracking-tighter outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-2">Subtitle</label>
                <textarea value={subTitle} onChange={e => setSubTitle(e.target.value)} rows={2} className="w-full bg-zinc-50 border border-zinc-200 p-3 font-bold text-sm outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-2">Intro Text</label>
                <textarea value={introText} onChange={e => setIntroText(e.target.value)} rows={3} className="w-full bg-zinc-50 border border-zinc-200 p-3 text-sm text-zinc-600 outline-none focus:border-black" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: INNER PAGES EDITOR */}
        <div className="col-span-1 lg:col-span-7 flex flex-col h-[85vh]">
          <div className="bg-white border-t-4 border-black shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center">
              <h2 className="font-black uppercase tracking-widest text-xs text-zinc-400">Inner Pages (Content)</h2>
            </div>
            <textarea
              className="w-full flex-1 p-8 bg-white resize-none focus:outline-none text-sm leading-relaxed text-zinc-800 font-mono"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        </div>

      </div>
    </div>
  );
}