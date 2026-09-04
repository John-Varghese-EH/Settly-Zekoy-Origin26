import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { ClassifiedIntent } from '@/types/pipeline';
import { CLASSIFIER_SYSTEM_PROMPT } from './prompts';

const intentSchema = z.object({
  intent: z.enum(['lookup', 'compare', 'explain_status', 'list_exceptions', 'general_question']),
  transaction_id: z.string().nullable(),
  date_range: z.object({
    from: z.string(),
    to: z.string()
  }).optional(),
  merchant_id: z.string().nullable(),
  confidence: z.number(),
  raw_parameters: z.record(z.unknown())
});

function heuristicFallback(input: string): ClassifiedIntent {
  const lower = input.toLowerCase();
  
  const txnMatch = input.match(/TXN-\d{3,}/i);
  if (txnMatch) {
    return {
      intent: 'lookup',
      transaction_id: txnMatch[0].toUpperCase(),
      merchant_id: null,
      confidence: 0.9,
      raw_parameters: {}
    };
  }
  
  if (lower.includes('exception') || lower.includes('error') || lower.includes('mismatch')) {
    return {
      intent: 'list_exceptions',
      transaction_id: null,
      merchant_id: null,
      confidence: 0.8,
      raw_parameters: {}
    };
  }

  if (lower.includes('between') || lower.includes('range')) {
    // Basic date parsing fallback
    return {
      intent: 'compare',
      transaction_id: null,
      date_range: { from: '2026-08-01T00:00:00Z', to: new Date().toISOString() },
      merchant_id: null,
      confidence: 0.7,
      raw_parameters: {}
    };
  }

  return {
    intent: 'general_question',
    transaction_id: null,
    merchant_id: null,
    confidence: 0,
    raw_parameters: {}
  };
}

export async function classifyIntent(scrubbed_input: string): Promise<ClassifiedIntent> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('No GEMINI_API_KEY found, using heuristic fallback for classification.');
    return heuristicFallback(scrubbed_input);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: scrubbed_input,
      config: {
        systemInstruction: CLASSIFIER_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return intentSchema.parse(parsed);
  } catch (error) {
    console.error('Classification error:', error);
    return heuristicFallback(scrubbed_input);
  }
}
