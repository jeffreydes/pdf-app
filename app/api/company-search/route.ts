import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get('q');

  if (!rawQuery || rawQuery.trim().length < 2) {
    return NextResponse.json([]);
  }

  const cleanQuery = rawQuery.replace(/[()]/g, '').trim();

  try {
    // We gebruiken de betrouwbare Wikidata/Wikipedia Search API voor instant bedrijfsherkenning
    const wikiRes = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(cleanQuery)}&language=en&format=json&type=item&limit=5`
    );

    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      if (wikiData.search && wikiData.search.length > 0) {
        const results = wikiData.search.map((item: any) => ({
          name: item.label,
          address: item.description || 'Registered Entity',
          companyNumber: item.id,
          jurisdiction: 'GLOBAL',
        }));
        return NextResponse.json(results);
      }
    }

    // Fallback: OpenCorporates
    const ocRes = await fetch(
      `https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(cleanQuery)}&per_page=5`
    );

    if (ocRes.ok) {
      const ocData = await ocRes.json();
      const companies = ocData.response?.companies || [];
      const results = companies.map((item: any) => ({
        name: item.company.name,
        address: item.company.registered_address_in_full || 'Registered Company',
        companyNumber: item.company.company_number,
        jurisdiction: (item.company.jurisdiction_code || 'EU').toUpperCase(),
      }));
      return NextResponse.json(results);
    }

    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json([]);
  }
}