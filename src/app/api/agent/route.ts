import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runPipeline } from '@/lib/agent/pipeline';

const requestSchema = z.object({
  message: z.string().min(1)
});

// Simple in-memory rate limiting (IP tracking)
const rateLimitMap = new Map<string, { count: number, resetAt: number }>();

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowMs = 60000;
    
    let rateData = rateLimitMap.get(ip);
    if (!rateData || now > rateData.resetAt) {
      rateData = { count: 0, resetAt: now + windowMs };
    }
    
    if (rateData.count >= 10) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    
    rateData.count += 1;
    rateLimitMap.set(ip, rateData);

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const result = await runPipeline(parsed.data.message);
    
    return NextResponse.json(result.response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal Server Error', details: message },
      { status: 500 }
    );
  }
}
