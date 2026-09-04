import { NextResponse } from 'next/server';
import { listExceptions } from '@/lib/data/engine';

export async function GET() {
  try {
    const exceptions = await listExceptions();
    
    // Filter to only those that are 'critical' elevated requests.
    // For this demo, we'll consider missing bank settlements or large amount discrepancies as critical.
    const elevated = exceptions.filter(e => {
      // Missing bank settlement
      if (!e.bank) return true;
      // Gateway amount > 50 is critical for demo purposes
      if (e.gateway && e.gateway.amount > 50) return true;
      return false;
    });

    return NextResponse.json({ elevated });
  } catch (error) {
    console.error('Failed to fetch elevated requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
