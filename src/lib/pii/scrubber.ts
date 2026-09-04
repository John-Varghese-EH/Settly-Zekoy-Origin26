// Deterministic regex patterns for PII redaction.
// PII scrubbing MUST run before any Gemini API calls to ensure sensitive 
// financial and personal data never leaves our secure boundary and isn't 
// inadvertently processed by LLM models.

const CC_PATTERN = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b/g;
const SSN_PATTERN = /\b(?!(000|666|9))\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b|\b\d{9}\b/g;
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const PHONE_PATTERN = /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

export function scrubPII(input: string): { scrubbed: string, redactions: Array<{type: string, original_length: number, position: number}> } {
  const redactions: Array<{type: string, original_length: number, position: number}> = [];
  let scrubbed = input;
  
  // A helper function to replace and track redactions
  const replaceAndTrack = (pattern: RegExp, type: string, replacement: string) => {
    let match;
    while ((match = pattern.exec(scrubbed)) !== null) {
      redactions.push({
        type,
        original_length: match[0].length,
        position: match.index,
      });
    }
    scrubbed = scrubbed.replace(pattern, replacement);
  };

  replaceAndTrack(CC_PATTERN, 'CC', '[REDACTED_CC]');
  replaceAndTrack(SSN_PATTERN, 'SSN', '[REDACTED_SSN]');
  replaceAndTrack(EMAIL_PATTERN, 'EMAIL', '[REDACTED_EMAIL]');
  replaceAndTrack(PHONE_PATTERN, 'PHONE', '[REDACTED_PHONE]');

  return { scrubbed, redactions };
}
