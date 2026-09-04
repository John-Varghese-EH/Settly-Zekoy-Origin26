import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.SEED_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stdout, stderr } = await execAsync('npx tsx scripts/seed-data.ts');
    
    return NextResponse.json({ success: true, stdout, stderr });
  } catch (error: any) {
    console.error('Seed API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
