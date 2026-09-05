import { NextResponse } from 'next/server';
import { getAllTransactions, listExceptions } from '@/lib/data/engine';
import { getResolutionLog } from '@/lib/data/resolution-log';

export async function GET() {
  try {
    const [transactions, exceptions] = await Promise.all([
      getAllTransactions(),
      listExceptions()
    ]);

    const resolutionLog = getResolutionLog();

    return NextResponse.json({ transactions, exceptions, resolutionLog });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
