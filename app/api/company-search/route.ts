import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const cleanQuery = query.trim();

  try {
    const results: Array<{ name: string; domain?: string; logo?: string; vatNumber?: string; address?: string; source?: string }> = [];

    // 1. EU VAT Number Check (e.g., BE0123456789)
    if (/^[A-Z]{2}[0-9A-Z]{8,12}$/i.test(cleanQuery)) {
      try {
        const countryCode = cleanQuery.substring(0, 2).toUpperCase();
        const vatNumber = cleanQuery.substring(2);
        const viesRes = await fetch(
          `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${vatNumber}`
        );

        if (viesRes.ok) {
          const data = await viesRes.json();
          if (data.isValid) {
            results.push({
              name: data.name !== '---' ? data.name : `VAT: ${cleanQuery.toUpperCase()}`,
              address: data.address !== '---' ? data.address.replace(/\n/g, ', ') : '',
              vatNumber: cleanQuery.toUpperCase(),
              source: 'Official EU VAT Registry',
            });
            return NextResponse.json({ results });
          }
        }
      } catch (e) {
        console.error('VIES lookup failed:', e);
      }
    }

    // 2. Clearbit Autocomplete API
    try {
      const clearbitRes = await fetch(
        `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(cleanQuery)}`
      );

      if (clearbitRes.ok) {
        const companies = await clearbitRes.json();
        if (Array.isArray(companies) && companies.length > 0) {
          companies.slice(0, 5).forEach((comp: any) => {
            if (comp.name) {
              results.push({
                name: comp.name,
                domain: comp.domain || '',
                logo: comp.logo || '',
                source: 'Verified Business',
              });
            }
          });
        }
      }
    } catch (e) {
      console.error('Clearbit API failed:', e);
    }

    // 3. Fallback: Wikidata (Filtered specifically for Business Entities/Organizations)
    if (results.length === 0) {
      try {
        const wikiRes = await fetch(
          `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(cleanQuery)}&language=en&format=json&type=item&origin=*`
        );

        if (wikiRes.ok) {
          const wikiData = await wikiRes.json();
          if (wikiData.search && Array.isArray(wikiData.search)) {
            // Filter out common dictionary concepts (like street, word, language)
            const filtered = wikiData.search.filter((item: any) => {
              const desc = (item.description || '').toLowerCase();
              return (
                desc.includes('company') ||
                desc.includes('corporation') ||
                desc.includes('business') ||
                desc.includes('enterprise') ||
                desc.includes('firm') ||
                desc.includes('agency') ||
                desc.includes('software') ||
                desc.includes('tech') ||
                desc.includes('brand') ||
                desc.includes('manufacturer')
              );
            });

            filtered.slice(0, 5).forEach((item: any) => {
              results.push({
                name: item.label,
                domain: item.description || 'Company',
                source: 'Registry Data',
              });
            });
          }
        }
      } catch (e) {
        console.error('Wikidata fallback failed:', e);
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Company search error:', error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}