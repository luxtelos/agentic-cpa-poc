/**
 * Utilities for handling text encoding issues in PDF generation
 */
import type { PDFFont, PDFPage as PDFLibPage, RGB } from 'pdf-lib';

// Common Unicode character replacements for WinAnsi encoding
const UNICODE_REPLACEMENTS: Record<string, string> = {
  '\u2248': '~',   // ≈ → ~
  '\u2260': '!=',  // ≠ → !=
  '\u2264': '<=',  // ≤ → <=
  '\u2265': '>=',  // ≥ → >=
  '\u00B1': '+/-', // ± → +/-
  '\u20AC': 'EUR', // € → EUR
  '\u00A3': 'GBP', // £ → GBP
  '\u00A5': 'JPY', // ¥ → JPY
  '\u201C': '"',   // “ → "
  '\u201D': '"',   // ” → "
  '\u2018': "'",   // ‘ → '
  '\u2019': "'",   // ’ → '
  '\u2013': '-',   // – → -
  '\u2014': '--',  // — → --
};

/**
 * Sanitizes text for WinAnsi encoding by replacing unsupported Unicode characters
 * @param text Input text potentially containing unsupported characters
 * @returns Text with unsupported characters replaced
 */
export function sanitizeForWinAnsi(text: string): string {
  return text.replace(/[^\u0000-\u00FF]/g, (char) => {
    return UNICODE_REPLACEMENTS[char] || ' ';
  });
}

/**
 * Safely draws text on a PDF page with fallback for unsupported characters
 * @param page PDF page to draw on
 * @param text Text to draw
 * @param options Drawing options
 */
export async function safeDrawText(
  page: PDFPage, 
  text: string, 
  options: TextDrawOptions
): Promise<void> {
  try {
    page.drawText(text, options);
  } catch (error) {
    if (error instanceof Error && error.message.includes('WinAnsi cannot encode')) {
      const sanitized = sanitizeForWinAnsi(text);
      page.drawText(sanitized, options);
      console.warn('Replaced unsupported characters in text:', {
        original: text,
        sanitized,
        error: error.message
      });
    } else {
      throw error;
    }
  }
}

// Type definitions for PDF operations
interface PDFPage {
  drawText(text: string, options: TextDrawOptions): void;
}

interface TextDrawOptions {
  x: number;
  y: number;
  size?: number;
  font?: PDFFont;
  color?: RGB | [number, number, number];
  rotate?: { angle: number; origin?: [number, number] };
  opacity?: number;
  lineHeight?: number;
}

// Export existing text measurement utilities for backward compatibility
export * from './pdfTextMeasurement';
