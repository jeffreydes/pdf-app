import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get('q');

  if (!rawQuery || rawQuery.trim().length < 2) {
    return NextResponse.json([]);
  }

  const cleanQuery = rawQuery.replace(/[()]/g, '').trim();
  const baseName = cleanQuery.replace(/\b(commv|bvba|bv|nv|vof|cv|vzw|ltd|inc|llc|gmbh)\b/gi, '').trim();
  const queryToUse = baseName.length >= 2 ? baseName : cleanQuery;

  try {
    const results: any[] = [];

    // 1. BELGIAN KBO / CBE DATA SEARCH
    try {
      const kboRes = await fetch(
        `https://kbodata.app/api/v1/companies/search?q=${encodeURIComponent(queryToUse)}`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (kboRes.ok) {
        const kboData = await kboRes.json();
        const items = Array.isArray(kboData) ? kboData : (kboData.results || kboData.data || []);

        items.slice(0, 5).forEach((item: any) => {
          const vatFormatted = item.vatNumber || item.kboNumber || item.enterpriseNumber;
          results.push({
            name: item.name || item.companyName,
            address: item.address ? `${item.address.street || ''} ${item.address.zip || ''} ${item.address.city || ''}`.trim() : (item.city ? `${item.zip || ''} ${item.city}` : 'Belgium'),
            companyNumber: vatFormatted ? `BE ${vatFormatted}` : 'BE',
            jurisdiction: 'BE',
          });
        });
      }
    } catch (e) {}

    // 2. WIKIDATA / WIKIPEDIA GLOBAL API
    if (results.length === 0) {
      try {
        const wikiRes = await fetch(
          `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(cleanQuery)}&language=en&format=json&type=item&limit=5`
        );

        if (wikiRes.ok) {
          const wikiData = await wikiRes.json();
          if (wikiData.search && wikiData.search.length > 0) {
            wikiData.search.forEach((item: any) => {
              results.push({
                name: item.label,
                address: item.description || 'Registered Entity',
                companyNumber: item.id,
                jurisdiction: 'GLOBAL',
              });
            });
          }
        }
      } catch (e) {}
    }

    // 3. OPENCORPORATES FALLBACK
    if (results.length === 0) {
      try {
        const ocRes = await fetch(
          `https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(queryToUse)}&per_page=5`
        );

        if (ocRes.ok) {
          const ocData = await ocRes.json();
          const companies = ocData.response?.companies || [];
          companies.forEach((item: any) => {
            results.push({
              name: item.company.name,
              address: item.company.registered_address_in_full || 'Registered Company',
              companyNumber: item.company.company_number,
              jurisdiction: (item.company.jurisdiction_code || 'EU').toUpperCase(),
            });
          });
        }
      } catch (e) {}
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json([]);
  }
}