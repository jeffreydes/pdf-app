import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const cleanQuery = query.trim();
  const results = [];

  try {
    // 1. MUST HAVE USER-AGENT: Wikidata blocks Vercel without this!
    const headers = {
      'User-Agent': 'QuoteBuilderApp/1.0 (https://pdfbuilder.org)',
      'Accept': 'application/json',
    };

    const wikiUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
      cleanQuery
    )}&language=en&format=json&type=item&origin=*`;

    const wikiRes = await fetch(wikiUrl, { headers });

    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      
      if (wikiData.search && Array.isArray(wikiData.search)) {
        wikiData.search.forEach((item: any) => {
          const desc = (item.description || '').toLowerCase();
          // Filter out generic words
          if (item.label && !desc.includes('street') && !desc.includes('noun')) {
            results.push({
              name: item.label,
              address: item.description || 'Verified Entity',
              source: 'Database',
            });
          }
        });
      }
    }

    // 2. BULLETPROOF FALLBACK: If nothing is found, let them use what they typed!
    if (results.length === 0) {
      results.push({
        name: cleanQuery,
        address: 'Custom Company Entry',
        source: 'Manual Input',
      });
    }

    return NextResponse.json({ results: results.slice(0, 5) });
    
  } catch (error) {
    console.error('API Error:', error);
    // 3. IF THE ENTIRE INTERNET BREAKS: Still return what the user typed
    return NextResponse.json({ 
      results: [{
        name: cleanQuery,
        address: 'Custom Company Entry',
        source: 'Manual Input',
      }]
    });
  }
}