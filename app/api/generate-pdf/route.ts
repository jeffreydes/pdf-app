import puppeteer from 'puppeteer-core';

interface LineItem {
  description: string;
  qty: number;
  price: number;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Dates & Quote details
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const quoteNumber = `QT-${Math.floor(100000 + Math.random() * 900000)}`;

    // Input values with fallbacks
    const clientName = data.clientName || 'Valued Client';
    const clientMeta = data.clientMeta || 'Requested via Quote Generator';
    const providerName = data.providerName || 'Your Company Name';
    const providerEmail = data.providerEmail || 'contact@yourcompany.com';
    const scopeText = data.scopeText || data.prompt || 'Services and deliverables as specified in the proposal agreement.';

    // Dynamic Line Items Calculations
    const items: LineItem[] = data.items && data.items.length > 0 
      ? data.items 
      : [{ description: 'Scope Execution & Deliverables', qty: 1, price: 2450 }];

    const vatRate = parseFloat(data.vatRate) || 21;

    const subtotal = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const vatAmount = subtotal * (vatRate / 100);
    const totalDue = subtotal + vatAmount;

    // Formatting currency
    const formatCurrency = (amount: number) => 
      new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

    const browser = await puppeteer.connect({
      browserWSEndpoint: 'wss://chrome.browserless.io?token=2Ux3shWGILlWVL2936ab4b2f23a7a88c7d45a76f61836bbaa'
    });

    const page = await browser.newPage();

    let logoHtml = '';
    if (data.logo) {
      logoHtml = `<img src="${data.logo}" class="company-logo" />`;
    }

    const watermarkHtml = data.isWatermarked 
      ? `<div class="watermark">PREVIEW DRAFT</div>` 
      : '';

    // Generate Table Rows Dynamically
    const tableRowsHtml = items.map(item => `
      <tr>
        <td>
          <strong>${item.description}</strong>
        </td>
        <td class="text-center">${item.qty}</td>
        <td class="text-right">${formatCurrency(item.price)}</td>
        <td class="text-right">${formatCurrency(item.qty * item.price)}</td>
      </tr>
    `).join('');

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

            @page { 
              size: A4; 
              margin: 20mm; 
            }
            * { box-sizing: border-box; }
            
            body { 
              margin: 0; 
              padding: 0; 
              font-family: 'Inter', -apple-system, sans-serif; 
              color: #111827; 
              background: #fff;
              font-size: 10pt;
              line-height: 1.5;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #E5E7EB;
              padding-bottom: 8mm;
              margin-bottom: 8mm;
            }

            .company-logo {
              max-height: 20mm;
              max-width: 60mm;
              object-fit: contain;
            }

            .quote-title {
              font-size: 28pt;
              font-weight: 800;
              letter-spacing: -1px;
              color: #111827;
              margin: 0;
              text-align: right;
            }

            .quote-meta {
              font-size: 9pt;
              color: #6B7280;
              text-align: right;
              margin-top: 2mm;
            }

            .details-grid {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10mm;
            }

            .details-block h4 {
              font-size: 8pt;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #6B7280;
              margin: 0 0 2mm 0;
            }

            .details-block p {
              margin: 0;
              font-weight: 500;
              color: #111827;
            }

            .summary-box {
              background: #F9FAFB;
              border: 1px solid #E5E7EB;
              border-radius: 6px;
              padding: 5mm;
              margin-bottom: 8mm;
            }

            .summary-box h3 {
              margin: 0 0 2mm 0;
              font-size: 11pt;
              font-weight: 700;
            }

            .summary-box p {
              margin: 0;
              color: #4B5563;
              font-size: 9.5pt;
            }

            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 8mm;
            }

            .items-table th {
              background: #F3F4F6;
              color: #374151;
              font-size: 8.5pt;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              padding: 3mm 4mm;
              text-align: left;
              border-bottom: 1px solid #D1D5DB;
            }

            .items-table td {
              padding: 4mm;
              border-bottom: 1px solid #E5E7EB;
              font-size: 9.5pt;
              color: #111827;
            }

            .text-right { text-align: right; }
            .text-center { text-align: center; }

            .totals-container {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 10mm;
            }

            .totals-table {
              width: 45%;
              border-collapse: collapse;
            }

            .totals-table td {
              padding: 2mm 0;
              font-size: 9.5pt;
              color: #4B5563;
            }

            .totals-table .grand-total {
              border-top: 2px solid #111827;
              font-size: 12pt;
              font-weight: 800;
              color: #111827;
              padding-top: 3mm;
            }

            .terms {
              border-top: 1px solid #E5E7EB;
              padding-top: 6mm;
              font-size: 8.5pt;
              color: #6B7280;
            }

            .terms h5 {
              margin: 0 0 1mm 0;
              font-size: 8.5pt;
              font-weight: 700;
              color: #374151;
            }

            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 7rem;
              font-weight: 900;
              color: rgba(0, 0, 0, 0.04);
              z-index: 9999;
              pointer-events: none;
            }
          </style>
        </head>
        <body>
          ${watermarkHtml}
          
          <div class="header">
            <div>
              ${logoHtml ? logoHtml : `<h2 style="margin:0; font-weight:800; font-size:18pt;">${providerName.toUpperCase()}</h2>`}
            </div>
            <div>
              <h1 class="quote-title">QUOTE</h1>
              <div class="quote-meta">
                <strong>Quote #:</strong> ${quoteNumber}<br/>
                <strong>Date:</strong> ${today}<br/>
                <strong>Valid Until:</strong> ${validUntil}
              </div>
            </div>
          </div>

          <div class="details-grid">
            <div class="details-block">
              <h4>Prepared For:</h4>
              <p>${clientName}</p>
              <p style="color:#6B7280; font-size:9pt;">${clientMeta}</p>
            </div>
            <div class="details-block" style="text-align: right;">
              <h4>Prepared By:</h4>
              <p>${providerName}</p>
              <p style="color:#6B7280; font-size:9pt;">${providerEmail}</p>
            </div>
          </div>

          <div class="summary-box">
            <h3>Project Scope & Objectives</h3>
            <p>${scopeText}</p>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <div class="totals-container">
            <table class="totals-table">
              <tr>
                <td>Subtotal</td>
                <td class="text-right">${formatCurrency(subtotal)}</td>
              </tr>
              <tr>
                <td>VAT (${vatRate}%)</td>
                <td class="text-right">${formatCurrency(vatAmount)}</td>
              </tr>
              <tr class="grand-total">
                <td>Total Due</td>
                <td class="text-right">${formatCurrency(totalDue)}</td>
              </tr>
            </table>
          </div>

          <div class="terms">
            <h5>Terms & Conditions</h5>
            <p style="margin:0;">Payment is due within 14 days from quote acceptance. Work will commence upon confirmation and deposit receipt.</p>
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