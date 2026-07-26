import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    // We gebruiken de gratis OpenCorporates API voor het zoeken op bedrijfsnaam
    const response = await fetch(
      `https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(query)}&per_page=5`,
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