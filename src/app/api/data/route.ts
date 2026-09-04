import { NextResponse } from 'next/server';
import { getAllTransactions, listExceptions } from '@/lib/data/engine';

export async function GET() {
  try {
    const [transactions, exceptions] = await Promise.all([
      getAllTransactions(),
      listExceptions()
    ]);

    return NextResponse.json({ transactions, exceptions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
