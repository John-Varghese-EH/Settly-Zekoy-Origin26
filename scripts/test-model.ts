import { GoogleGenAI } from '@google/genai';
require('dotenv').config({ path: '.env.local' });

async function test() {
  const ai = new GoogleGenAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello',
    });
    console.log('Success with gemini-2.5-flash:', response.text);
  } catch (e) {
    console.error('Error gemini-2.5-flash:', e.message);
  }
}
test();
