import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get('q');

  if (!rawQuery || rawQuery.trim().length < 2) {
    return NextResponse.json([]);
  }

  // 1. Clean query for Belgian corporate suffix variations
  const cleanQuery = rawQuery.replace(/[()]/g, '').trim();
  const baseName = cleanQuery.replace(/\b(commv|bvba|bv|nv|vof|cv|vzw|ltd|inc|llc|gmbh)\b/gi, '').trim();
  const queryToSearch = baseName.length >= 2 ? baseName : cleanQuery;

  try {
    const results: any[] = [];

    // 2. DIRECT SPARQL QUERY TO WIKIDATA'S BELGIAN ENTERPRISE DATASET
    // P2762 = Belgian CBE/KBO enterprise number
    // Q31 = Belgium jurisdiction
    const sparqlQuery = `
      SELECT DISTINCT ?item ?itemLabel ?cbeNumber ?addressLabel WHERE {
        {
          ?item wdt:P31/wdt:P279* wd:Q4830453 . # Business / Enterprise
          ?item wdt:P17 wd:Q31 .               # Located in Belgium
          ?item rdfs:label ?itemLabel .
          FILTER(CONTAINS(LOWER(?itemLabel), LOWER("${queryToSearch}")))
        }
        UNION
        {
          ?item wdt:P2762 ?cbeNumber .         # Match directly on KBO/CBE number
          FILTER(CONTAINS(?cbeNumber, "${queryToSearch}"))
        }
        OPTIONAL { ?item wdt:P2762 ?cbeNumber . }
        OPTIONAL { ?item wdt:P6375 ?addressLabel . }
        FILTER(LANG(?itemLabel) = "en" || LANG(?itemLabel) = "nl" || LANG(?itemLabel) = "fr")
      }
      LIMIT 6
    `;

    const wikidataUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;

    const sparqlRes = await fetch(wikidataUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'QuoteBuilderApp/1.0 (https://quotebuilder.app; contact@quotebuilder.app)'
      }
    });

    if (sparqlRes.ok) {
      const sparqlData = await sparqlRes.json();
      const bindings = sparqlData.results?.bindings || [];

      bindings.forEach((b: any) => {
        const rawCbe = b.cbeNumber?.value || '';
        const formattedVat = rawCbe ? `BE ${rawCbe.replace(/[^0-9]/g, '')}` : 'BE (Registered)';

        results.push({
          name: b.itemLabel?.value || queryToSearch,
          address: b.addressLabel?.value || 'Belgium',
          companyNumber: formattedVat,
          jurisdiction: 'BE',
        });
      });
    }

    // 3. FALLBACK: WIKIDATA SEARCH API (Catches Belgian companies without explicit SPARQL tags)
    if (results.length === 0) {
      const fallbackUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(queryToSearch)}&language=nl&format=json&type=item&limit=5`;
      const fallbackRes = await fetch(fallbackUrl);

      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        const searchItems = fallbackData.search || [];

        searchItems.forEach((item: any) => {
          results.push({
            name: item.label,
            address: item.description || 'Belgian Registered Entity',
            companyNumber: `BE (${item.id})`,
            jurisdiction: 'BE',
          });
        });
      }
    }

    // Deduplicate results by company name
    const uniqueResults = Array.from(new Set(results.map(r => r.name)))
      .map(name => results.find(r => r.name === name));

    return NextResponse.json(uniqueResults);
  } catch (error) {
    console.error('Company search error:', error);
    return NextResponse.json([]);
  }
}