import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get('q');

  if (!rawQuery || rawQuery.trim().length < 2) {
    return NextResponse.json([]);
  }

  // Strippen van haakjes en veelvoorkomende Belgische/EU rechtspersonen voor een schonere zoekopdracht
  const cleanQuery = rawQuery.replace(/[()]/g, '').trim();
  const baseName = cleanQuery.replace(/\b(commv|bvba|bv|nv|vof|cv|vzw|ltd|inc|llc|gmbh|sarl)\b/gi, '').trim();
  const queryToUse = baseName.length >= 2 ? baseName : cleanQuery;

  try {
    const results: any[] = [];

    // 1. DRECT BELGISCH KBO & EU REGISTER (Via Publieke OpenData API Endpoint)
    try {
      const kboRes = await fetch(
        `https://kbodata.app/api/v1/companies/search?q=${encodeURIComponent(queryToUse)}`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (kboRes.ok) {
        const kboData = await kboRes.json();
        const items = Array.isArray(kboData) ? kboData : (kboData.results || kboData.data || []);

        items.slice(0, 5).forEach((item: any) => {
          const vatNum = item.vatNumber || item.kboNumber || item.enterpriseNumber;
          const formattedVat = vatNum ? `BE ${vatNum.toString().replace(/[^0-9]/g, '')}` : 'BE (KBO Registered)';
          
          results.push({
            name: item.name || item.companyName,
            address: item.address 
              ? `${item.address.street || ''} ${item.address.zip || ''} ${item.address.city || ''}`.trim() 
              : (item.city ? `${item.zip || ''} ${item.city}` : 'Belgium'),
            companyNumber: formattedVat,
            jurisdiction: 'BE',
          });
        });
      }
    } catch (e) {
      // Stilzwijgend doorgaan naar fallback bij time-out
    }

    // 2. WIKIDATA DIRECT SEARCH (Aangescherpt op bedrijven & organisaties)
    if (results.length < 3) {
      try {
        const wikiUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(queryToUse)}&language=nl&format=json&type=item&limit=8`;
        const wikiRes = await fetch(wikiUrl);

        if (wikiRes.ok) {
          const wikiData = await wikiRes.json();
          const searchItems = wikiData.search || [];

          searchItems.forEach((item: any) => {
            const desc = (item.description || '').toLowerCase();
            
            // Controleer of de beschrijving duidt op een bedrijf/organisatie en sluit willekeurige dingen uit
            const isCompany = desc.includes('bedrijf') || desc.includes('company') || desc.includes('onderneming') || 
                              desc.includes('organisatie') || desc.includes('corporation') || desc.includes('firm') ||
                              desc.includes('bv') || desc.includes('nv') || desc.includes('inc') || desc.includes('ltd');

            if (isCompany || searchItems.length <= 2) {
              results.push({
                name: item.label,
                address: item.description || 'Registered Entity',
                companyNumber: `EU / ${item.id}`,
                jurisdiction: 'EU',
              });
            }
          });
        }
      } catch (e) {}
    }

    // 3. UNIEKE BEDRIJVEN FILTEREN & DEDUPLICEREN
    const uniqueMap = new Map();
    results.forEach(r => {
      const normalizedName = r.name.toLowerCase().trim();
      if (!uniqueMap.has(normalizedName)) {
        uniqueMap.set(normalizedName, r);
      }
    });

    const finalResults = Array.from(uniqueMap.values()).slice(0, 5);

    return NextResponse.json(finalResults);
  } catch (error) {
    console.error('API Search Error:', error);
    return NextResponse.json([]);
  }
}