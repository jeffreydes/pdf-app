import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const cleanQuery = query.trim();

  try {
    const results: Array<{
      name: string;
      domain?: string;
      logo?: string;
      vatNumber?: string;
      address?: string;
      source?: string;
    }> = [];

    // 1. Check if it's an EU VAT Number (e.g. BE0123456789)
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
              source: 'Official EU Registry',
            });
            return NextResponse.json({ results });
          }
        }
      } catch (e) {
        console.error('VIES lookup failed:', e);
      }
    }

    // 2. Direct Search via Wikidata (Open, reliable, fast)
    const wikiUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
      cleanQuery
    )}&language=en&format=json&type=item&origin=*`;

    const wikiRes = await fetch(wikiUrl);

    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();

      if (wikiData.search && Array.isArray(wikiData.search)) {
        // Exclude common generic dictionary terms (like 'street', 'word', 'unit')
        const genericTerms = ['street', 'thoroughfare', 'common noun', 'unit of measurement'];

        wikiData.search.forEach((item: any) => {
          const description = item.description || '';
          const isGeneric = genericTerms.some((term) =>
            description.toLowerCase().includes(term)
          );

          if (!isGeneric && item.label) {
            // Predict probable domain for favicon display
            const domainGuess = `${item.label.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
            const logoUrl = `https://www.google.com/s2/favicons?domain=${domainGuess}&sz=64`;

            results.push({
              name: item.label,
              domain: description || 'Company',
              logo: logoUrl,
              source: 'Verified Entity',
            });
          }
        });
      }
    }

    return NextResponse.json({ results: results.slice(0, 5) });
  } catch (error) {
    console.error('Company search error:', error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}