import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

const formatText = (txt: string) => (txt ? txt.replace(/\n/g, '<br/>') : '');

function parseContent(rawText: string) {
  if (!rawText) return '';
  const lines = rawText.split('\n');
  let html = '';
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t.length === 0) continue;

    // Page Break
    if (t === '---') {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<div style="page-break-before: always;"></div>`;
      continue;
    }

    // # Grote Pagina Header
    if (t.startsWith('# ')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<h1 class="page-header">${t.substring(2)}</h1>\n`;
      continue;
    }

    // ## Subheader 
    if (t.startsWith('## ')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<h2 class="accent-header">${t.substring(3)}</h2>\n`;
      continue;
    }

    // ### Accent Balk
    if (t.startsWith('### ')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<h3 class="accent-bar">${t.substring(4)}</h3>\n`;
      continue;
    }

    // [PRICE] blokken
    if (t.startsWith('[PRICE] ')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      const content = t.substring(8);
      const split = content.split(':');
      if (split.length === 2) {
        html += `
          <div class="price-box">
            <div class="price-title">${split[0].trim()}</div>
            <div class="price-value">${split[1].trim()}</div>
          </div>\n`;
      } else {
        html += `<div class="price-box"><div class="price-value">${content}</div></div>\n`;
      }
      continue;
    }

    // Lijstjes
    if (t.startsWith('- ') || t.startsWith('* ')) {
      if (!inList) { html += `<ul class="custom-list">\n`; inList = true; }
      const split = t.substring(2).split(':');
      if (split.length === 2) {
        html += `<li><span class="list-left">${split[0].trim()}</span><span class="list-right">${split[1].trim()}</span></li>\n`;
      } else {
        html += `<li>${t.substring(2)}</li>\n`;
      }
      continue;
    }

    if (inList) { html += '</ul>\n'; inList = false; }
    html += `<p>${t}</p>\n`;
  }

  if (inList) { html += '</ul>\n'; }
  return html;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const parsedHtml = parseContent(data.text);
    
    const accentColor = data.accentColor || '#E31837';
    const columns = data.columns || 2; 
    
    // Contrast Logica: Als de kleur geel of lichtgrijs is, gebruik zwarte tekst erop. Anders witte tekst.
    const isLightColor = accentColor.toUpperCase() === '#FACC15' || accentColor.toUpperCase() === '#D1D5DB';
    const contrastTextColor = isLightColor ? '#111111' : '#FFFFFF';

    // Font Logica
    let fontFaceRule = '';
    let fontFamilyRule = `'Inter', sans-serif`;
    
    if (data.customFont) {
      fontFaceRule = `
        @font-face {
          font-family: 'CustomUserFont';
          src: url('${data.customFont}');
        }
      `;
      fontFamilyRule = `'CustomUserFont', 'Inter', sans-serif`;
    }

    // Check of we lokaal (development) of in de cloud (production op Vercel) draaien
    const isDev = process.env.NODE_ENV === 'development';

    const browser = await puppeteer.launch({
      args: isDev ? [] : chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: isDev
        ? undefined
        : await chromium.executablePath(
            'https://github.com/sparticuz/chromium/releases/download/v131.0.0/chromium-v131.0.0-pack.tar'
          ),
      headless: isDev ? true : chromium.headless,
    });

    const page = await browser.newPage();

    let coverImageHtml = '';
    let innerImageHtml = '';
    
    if (data.images && data.images.length > 0) {
      coverImageHtml = `<div class="cover-image" style="background-image: url('${data.images[0]}');"></div>`;
      if (data.images.length > 1) {
        innerImageHtml = `<div class="inner-image"><img src="${data.images[1]}" /></div>`;
      }
    }

    const watermarkHtml = data.isWatermarked 
      ? `<div class="watermark">PREVIEW</div>` 
      : '';

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
            
            ${fontFaceRule}

            :root {
              --accent: ${accentColor};
              --accent-text: ${contrastTextColor};
              --black: #111111;
              --gray: #F3F4F6;
              --text-gray: #6B7280;
            }

            /* Marges voor alle PDF pagina's */
            @page { size: A4; margin: 25mm 20mm; }
            * { box-sizing: border-box; }
            
            body { 
              margin: 0; 
              padding: 0; 
              font-family: ${fontFamilyRule}; 
              color: var(--black); 
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            /* COVER PAGE */
            .cover-page {
              min-height: calc(297mm - 50mm);
              display: flex;
              flex-direction: column;
              page-break-after: always;
              position: relative;
            }

            .cover-middle {
              flex-grow: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
              border-top: 5px solid var(--black);
              padding-top: 15mm;
              padding-bottom: ${coverImageHtml ? '10mm' : '0'};
            }

            .main-title {
              font-size: 65pt;
              font-weight: 900;
              letter-spacing: -3px;
              line-height: 0.9;
              margin: 0 0 10mm 0;
              color: var(--black);
              text-transform: capitalize;
            }

            .sub-title {
              font-size: 14pt;
              font-weight: 800;
              line-height: 1.2;
              margin: 0 0 4mm 0;
              white-space: pre-line;
            }

            .intro-text {
              font-size: 9pt;
              font-weight: 600;
              color: var(--text-gray);
              line-height: 1.5;
              width: 60%;
              margin: 0;
            }

            .cover-image {
              margin-left: -20mm;
              margin-right: -20mm;
              margin-bottom: -25mm;
              height: 110mm;
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;
              border-top: 4px solid var(--black);
            }

            /* INNER PAGES */
            .page-header {
              font-size: 38pt;
              font-weight: 900;
              letter-spacing: -2px;
              color: var(--black);
              border-bottom: 2px solid var(--gray);
              padding-bottom: 8mm;
              margin-top: 0;
              margin-bottom: 12mm;
              line-height: 1;
              break-after: avoid;
            }

            .content-grid {
              column-count: ${columns};
              column-gap: 15mm;
              column-fill: balance;
            }

            .accent-header {
              font-size: 24pt;
              font-weight: 900;
              letter-spacing: -1px;
              margin: 0 0 6mm 0;
              line-height: 1;
              color: var(--black);
              break-after: avoid;
            }

            .accent-bar {
              background-color: var(--accent);
              color: var(--accent-text);
              padding: 3mm 5mm;
              font-size: 11pt;
              font-weight: 800;
              margin-top: 6mm;
              margin-bottom: 3mm;
              display: block;
              break-after: avoid;
            }

            .price-box {
              background-color: #E5E7EB;
              padding: 5mm;
              margin-top: 4mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              break-inside: avoid;
            }
            .price-title {
              background-color: var(--accent);
              color: var(--accent-text);
              font-size: 8pt;
              font-weight: 800;
              padding: 2px 8px;
              margin-bottom: 4mm;
              text-transform: uppercase;
            }
            .price-value {
              font-size: 26pt;
              font-weight: 900;
              letter-spacing: -1px;
              color: var(--black);
              line-height: 1;
            }

            p {
              font-size: 9.5pt;
              line-height: 1.6;
              color: var(--text-gray);
              margin-top: 0;
              margin-bottom: 5mm;
              font-weight: 600;
              orphans: 3;
              widows: 3;
            }

            .custom-list {
              padding-left: 0;
              list-style: none;
              margin-bottom: 8mm;
            }
            .custom-list li {
              font-size: 9pt;
              font-weight: 800;
              color: var(--black);
              border-bottom: 1px solid var(--gray);
              padding: 3mm 0;
              position: relative;
              padding-left: 12px;
              display: flex;
              justify-content: space-between;
              break-inside: avoid;
            }
            .custom-list li::before {
              content: "■";
              color: var(--black);
              font-size: 5pt;
              position: absolute;
              left: 0;
              top: 5mm;
            }
            .list-left { color: var(--black); }
            .list-right { color: var(--text-gray); font-weight: 600; }

            .inner-image {
              margin-bottom: 10mm;
              break-inside: avoid;
            }
            .inner-image img {
              width: 100%;
              height: auto;
              border: 1px solid var(--gray);
            }

            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 10rem;
              font-weight: 900;
              color: rgba(0, 0, 0, 0.05);
              z-index: 9999;
              pointer-events: none;
            }
          </style>
        </head>
        <body>
          ${watermarkHtml}
          
          <!-- COVER PAGE -->
          <div class="cover-page">
            <div class="cover-middle">
              <h1 class="main-title">${formatText(data.mainTitle)}</h1>
              <h3 class="sub-title">${formatText(data.subTitle)}</h3>
              <p class="intro-text">${formatText(data.introText)}</p>
            </div>
            ${coverImageHtml}
          </div>

          <!-- INNER PAGES CONTENT -->
          <div class="content-grid">
            ${innerImageHtml}
            ${parsedHtml}
          </div>

        </body>
      </html>
    `;

    await page.setContent(fullHtml, { waitUntil: 'load' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    return new Response(pdfBuffer as any, { 
      status: 200, 
      headers: { 'Content-Type': 'application/pdf' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'PDF generation failed' }), { status: 500 });
  }
}