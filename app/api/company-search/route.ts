import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 3) {
    return NextResponse.json({ results: [] });
  }

  const cleanQuery = query.trim();

  try {
    // 1. EU VAT Number check (e.g., BE0123456789)
    if (/^[A-Z]{2}[0-9A-Z]{8,12}$/i.test(cleanQuery)) {
      const countryCode = cleanQuery.substring(0, 2).toUpperCase();
      const vatNumber = cleanQuery.substring(2);

      const viesRes = await fetch(
        `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${vatNumber}`
      );

      if (viesRes.ok) {
        const data = await viesRes.json();
        if (data.isValid) {
          return NextResponse.json({
            results: [
              {
                name: data.name !== '---' ? data.name : `VAT: ${cleanQuery.toUpperCase()}`,
                address: data.address !== '---' ? data.address.replace(/\n/g, ', ') : '',
                vatNumber: cleanQuery.toUpperCase(),
                country: countryCode,
                source: 'VIES Official EU Registry',
              },
            ],
          });
        }
      }
    }

    // 2. Company Name Auto-complete via Clearbit API
    const clearbitRes = await fetch(
      `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(cleanQuery)}`
    );

    if (clearbitRes.ok) {
      const companies = await clearbitRes.json();

      const results = companies.slice(0, 5).map((comp: { name: string; domain?: string; logo?: string }) => ({
        name: comp.name,
        domain: comp.domain,
        logo: comp.logo,
        source: 'Registered Company',
      }));

      return NextResponse.json({ results });
    }

    return NextResponse.json({ results: [] });
  } catch (error) {
    console.error('Company search error:', error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}