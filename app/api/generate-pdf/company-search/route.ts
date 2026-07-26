import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get('q');

  if (!rawQuery || rawQuery.trim().length < 2) {
    return NextResponse.json([]);
  }

  // Schoon de zoekopdracht op: verwijder haakjes en extra spaties
  // "studio des ( commV )" -> "studio des commV" & "studio des"
  const cleanQuery = rawQuery.replace(/[()]/g, '').trim();
  const baseName = cleanQuery.replace(/\b(commv|bvba|bv|nv|vof|cv|vzw)\b/gi, '').trim();

  // Probeer eerst op de opgeschoonde naam, anders op de basisnaam
  const queryToUse = baseName.length >= 2 ? baseName : cleanQuery;

  try {
    const response = await fetch(
      `https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(queryToUse)}&per_page=6`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) {
      return NextResponse.json([]);
    }

    const data = await response.json();
    const companies = data.response?.companies || [];

    const results = companies.map((item: any) => ({
      name: item.company.name,
      address: item.company.registered_address_in_full || `${item.company.jurisdiction_code.toUpperCase()}`,
      companyNumber: item.company.company_number,
      jurisdiction: item.company.jurisdiction_code.toUpperCase(),
    }));

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json([]);
  }
}