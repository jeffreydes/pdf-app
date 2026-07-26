import puppeteer from 'puppeteer-core';

const formatText = (txt: string) => (txt ? txt.replace(/\n/g, '<br/>') : '');

function parseContent(rawText: string) {
  if (!rawText) return '';
  const lines = rawText.split('\n');
  let html = '';
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t.length === 0) continue;

    if (t === '---') {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<div style="page-break-before: always;"></div>`;
      continue;
    }

    if (t.startsWith('# ')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<h1 class="page-header">${t.substring(2)}</h1>\n`;
      continue;
    }

    if (t.startsWith('## ')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<h2 class="accent-header">${t.substring(3)}</h2>\n`;
      continue;
    }

    if (t.startsWith('### ')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<h3 class="accent-bar">${t.substring(4)}</h3>\n`;
      continue;
    }

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
    
    const accentColor = data.accentColor || '#A855F7'; 
    const columns = data.columns || 2; 

    const browser = await puppeteer.connect({
      browserWSEndpoint: 'wss://chrome.browserless.io?token=2Ux3shWGILlWVL2936ab4b2f23a7a88c7d45a76f61836bbaa'
    });

    const page = await browser.newPage();

    let coverImageHtml = '';
    if (data.logo) {
      coverImageHtml = `<div class="logo-container"><img src="${data.logo}" class="brand-logo" /></div>`;
    }

    const watermarkHtml = data.isWatermarked 
      ? `<div class="watermark">PREVIEW</div>` 
      : '';

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

            :root {
              --accent: ${accentColor};
              --black: #0A0A0C;
              --gray: #F4F4F6;
              --text-gray: #66666E;
            }

            @page { size: A4; margin: 25mm 20mm; }
            * { box-sizing: border-box; }
            
            body { 
              margin: 0; 
              padding: 0; 
              font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; 
              color: var(--black); 
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .cover-page {
              min-height: calc(297mm - 50mm);
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-after: always;
            }

            .logo-container { margin-bottom: 20mm; }
            .brand-logo { max-height: 25mm; max-width: 65mm; object-fit: contain; }

            .main-title {
              font-size: 54pt;
              font-weight: 900;
              letter-spacing: -2.5px;
              line-height: 0.95;
              margin: 0 0 8mm 0;
              color: var(--black);
            }

            .sub-title {
              font-size: 15pt;
              font-weight: 700;
              line-height: 1.3;
              margin: 0 0 6mm 0;
              color: var(--black);
              white-space: pre-line;
            }

            .intro-text {
              font-size: 10pt;
              font-weight: 500;
              color: var(--text-gray);
              line-height: 1.6;
              width: 80%;
              margin: 0;
            }

            .page-header {
              font-size: 30pt;
              font-weight: 800;
              letter-spacing: -1.5px;
              color: var(--black);
              border-bottom: 1px solid var(--gray);
              padding-bottom: 6mm;
              margin-top: 0;
              margin-bottom: 10mm;
              line-height: 1;
              break-after: avoid;
            }

            .content-grid {
              column-count: ${columns};
              column-gap: 12mm;
              column-fill: balance;
            }

            .accent-header {
              font-size: 20pt;
              font-weight: 800;
              letter-spacing: -0.8px;
              margin: 0 0 5mm 0;
              color: var(--black);
              break-after: avoid;
            }

            .accent-bar {
              background-color: var(--accent);
              color: #FFFFFF;
              padding: 3mm 5mm;
              font-size: 10pt;
              font-weight: 700;
              border-radius: 6px;
              margin-top: 6mm;
              margin-bottom: 4mm;
              display: block;
              break-after: avoid;
            }

            .price-box {
              background-color: var(--gray);
              padding: 6mm;
              border-radius: 10px;
              margin-top: 5mm;
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              break-inside: avoid;
            }
            .price-title {
              font-size: 8pt;
              font-weight: 800;
              color: var(--text-gray);
              margin-bottom: 2mm;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .price-value {
              font-size: 24pt;
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
              margin-bottom: 4mm;
              font-weight: 500;
            }

            .custom-list {
              padding-left: 0;
              list-style: none;
              margin-bottom: 6mm;
            }
            .custom-list li {
              font-size: 9pt;
              font-weight: 600;
              color: var(--black);
              border-bottom: 1px solid var(--gray);
              padding: 3mm 0;
              display: flex;
              justify-content: space-between;
              break-inside: avoid;
            }
            .list-left { color: var(--black); }
            .list-right { color: var(--text-gray); font-weight: 500; }

            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 8rem;
              font-weight: 900;
              color: rgba(0, 0, 0, 0.04);
              z-index: 9999;
              pointer-events: none;
            }
          </style>
        </head>
        <body>
          ${watermarkHtml}
          
          <div class="cover-page">
            <div>
              ${coverImageHtml}
              <h1 class="main-title">${formatText(data.mainTitle)}</h1>
              <h3 class="sub-title">${formatText(data.subTitle)}</h3>
            </div>
            <p class="intro-text">${formatText(data.introText)}</p>
          </div>

          <div class="content-grid">
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