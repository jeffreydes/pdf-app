import puppeteer from 'puppeteer-core';

interface LineItem {
  description: string;
  qty: number;
  price: number;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const quoteNumber = `QT-${Math.floor(100000 + Math.random() * 900000)}`;

    const clientName = data.clientName || 'Valued Client';
    const clientCompany = data.clientCompany || '';
    const clientAddress = data.clientAddress || 'Billing Address';
    const clientEmail = data.clientEmail || '';

    const providerName = data.providerName || 'Your Company Name';
    const providerAddress = data.providerAddress || '123 Business St, City';
    const providerPhone = data.providerPhone || '+1 (555) 000-0000';
    const providerEmail = data.providerEmail || 'contact@yourcompany.com';
    const providerVat = data.providerVat || 'VAT: EU123456789B01';

    const projectTimeline = data.projectTimeline || 'Expected start: Upon approval. Est. completion: 4 weeks.';
    const scopeText = data.scopeText || data.prompt || 'Services and deliverables as specified in the proposal agreement.';

    const items: LineItem[] = data.items && data.items.length > 0 
      ? data.items 
      : [{ description: 'Project Scope Execution', qty: 10, price: 85 }];

    const vatRate = parseFloat(data.vatRate) || 21;
    const subtotal = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const vatAmount = subtotal * (vatRate / 100);
    const totalDue = subtotal + vatAmount;

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

    const tableRowsHtml = items.map(item => `
      <tr>
        <td><strong>${item.description}</strong></td>
        <td class="text-center">${item.qty} hrs</td>
        <td class="text-right">${formatCurrency(item.price)} / hr</td>
        <td class="text-right">${formatCurrency(item.qty * item.price)}</td>
      </tr>
    `).join('');

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

            @page { size: A4; margin: 18mm 20mm; }
            * { box-sizing: border-box; }
            
            body { 
              margin: 0; padding: 0; 
              font-family: 'Inter', -apple-system, sans-serif; 
              color: #111827; background: #fff;
              font-size: 9.5pt; line-height: 1.5;
              -webkit-print-color-adjust: exact; print-color-adjust: exact;
            }

            .header {
              display: flex; justify-content: space-between; align-items: flex-start;
              border-bottom: 2px solid #E5E7EB; padding-bottom: 6mm; margin-bottom: 6mm;
            }

            .company-logo { max-height: 18mm; max-width: 55mm; object-fit: contain; }

            .quote-title {
              font-size: 26pt; font-weight: 800; letter-spacing: -1px;
              color: #111827; margin: 0; text-align: right;
            }

            .quote-meta { font-size: 8.5pt; color: #4B5563; text-align: right; margin-top: 2mm; }

            .details-grid { display: flex; justify-content: space-between; margin-bottom: 8mm; }
            .details-block { width: 48%; }
            .details-block h4 {
              font-size: 8pt; font-weight: 700; text-transform: uppercase;
              letter-spacing: 0.5px; color: #6B7280; margin: 0 0 2mm 0;
            }
            .details-block p { margin: 0; font-size: 9pt; color: #374151; }

            .summary-box {
              background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px;
              padding: 4mm 5mm; margin-bottom: 6mm;
            }
            .summary-box h3 { margin: 0 0 1.5mm 0; font-size: 10pt; font-weight: 700; }
            .summary-box p { margin: 0; color: #4B5563; font-size: 9pt; }

            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 6mm; }
            .items-table th {
              background: #F3F4F6; color: #374151; font-size: 8pt; font-weight: 700;
              text-transform: uppercase; letter-spacing: 0.5px; padding: 2.5mm 3.5mm;
              text-align: left; border-bottom: 1px solid #D1D5DB;
            }
            .items-table td { padding: 3mm 3.5mm; border-bottom: 1px solid #E5E7EB; font-size: 9pt; color: #111827; }

            .text-right { text-align: right; }
            .text-center { text-align: center; }

            .totals-container { display: flex; justify-content: flex-end; margin-bottom: 8mm; }
            .totals-table { width: 45%; border-collapse: collapse; }
            .totals-table td { padding: 1.5mm 0; font-size: 9pt; color: #4B5563; }
            .totals-table .grand-total {
              border-top: 2px solid #111827; font-size: 11pt; font-weight: 800;
              color: #111827; padding-top: 2.5mm;
            }

            .terms-grid {
              display: flex; justify-content: space-between; gap: 6mm;
              border-top: 1px solid #E5E7EB; padding-top: 5mm; margin-bottom: 6mm;
            }
            .terms-box { width: 48%; font-size: 8pt; color: #6B7280; }
            .terms-box h5 { margin: 0 0 1mm 0; font-size: 8pt; font-weight: 700; color: #374151; }

            /* SIGN-OFF BLOCK CORRECTION */
            .signoff-container {
              border: 1px solid #E5E7EB; border-radius: 6px; padding: 5mm 6mm;
              background: #FAFAFA; display: flex; justify-content: space-between; gap: 10mm;
            }
            .signoff-box { width: 48%; }
            .signoff-title { font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #374151; margin-bottom: 10mm; }
            
            .signoff-lines {
              display: flex; justify-content: space-between; gap: 4mm;
            }
            .signoff-field { flex: 1; }
            .signoff-line { border-bottom: 1px solid #9CA3AF; height: 1px; margin-bottom: 1.5mm; }
            .signoff-label { font-size: 7.5pt; color: #6B7280; }

            .watermark {
              position: fixed; top: 50%; left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 7rem; font-weight: 900; color: rgba(0, 0, 0, 0.04);
              z-index: 9999; pointer-events: none;
            }
          </style>
        </head>
        <body>
          ${watermarkHtml}
          
          <div class="header">
            <div>
              ${logoHtml ? logoHtml : `<h2 style="margin:0; font-weight:800; font-size:16pt;">${providerName.toUpperCase()}</h2>`}
              <div style="font-size: 8pt; color: #6B7280; margin-top: 2mm;">
                ${providerAddress}<br/>
                ${providerPhone} | ${providerEmail}<br/>
                <strong>${providerVat}</strong>
              </div>
            </div>
            <div>
              <h1 class="quote-title">QUOTE</h1>
              <div class="quote-meta">
                <strong>Quote #:</strong> ${quoteNumber}<br/>
                <strong>Issue Date:</strong> ${today}<br/>
                <strong>Expiry Date:</strong> ${validUntil}
              </div>
            </div>
          </div>

          <div class="details-grid">
            <div class="details-block">
              <h4>PREPARED FOR (CLIENT):</h4>
              <p><strong>${clientName}</strong> ${clientCompany ? `(${clientCompany})` : ''}</p>
              <p>${clientAddress}</p>
              <p>${clientEmail}</p>
            </div>
            <div class="details-block" style="text-align: right;">
              <h4>PROJECT TIMELINE:</h4>
              <p>${projectTimeline}</p>
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
                <th class="text-center">Hours</th>
                <th class="text-right">Rate</th>
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

          <div class="terms-grid">
            <div class="terms-box">
              <h5>Payment Terms</h5>
              <p style="margin:0;">Payment is due within 14 days from acceptance date. A 30% deposit is required before work commences.</p>
            </div>
            <div class="terms-box">
              <h5>Terms & Conditions</h5>
              <p style="margin:0;">This quote is subject to our standard terms of service. Prices remain valid until the stated expiry date.</p>
            </div>
          </div>

          <!-- SIGN-OFF BLOCK CORRECTION -->
          <div class="signoff-container">
            <div class="signoff-box">
              <div class="signoff-title">CLIENT APPROVAL & SIGNATURE</div>
              <div class="signoff-lines">
                <div class="signoff-field" style="flex:2;">
                  <div class="signoff-line"></div>
                  <div class="signoff-label">Authorized Signature</div>
                </div>
                <div class="signoff-field" style="flex:1;">
                  <div class="signoff-line"></div>
                  <div class="signoff-label">Date</div>
                </div>
              </div>
            </div>

            <div class="signoff-box">
              <div class="signoff-title">PROVIDER CONFIRMATION (${providerName})</div>
              <div class="signoff-lines">
                <div class="signoff-field" style="flex:2;">
                  <div class="signoff-line"></div>
                  <div class="signoff-label">Authorized Signature</div>
                </div>
                <div class="signoff-field" style="flex:1;">
                  <div class="signoff-line"></div>
                  <div class="signoff-label">Date</div>
                </div>
              </div>
            </div>
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