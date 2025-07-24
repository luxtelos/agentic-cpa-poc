import type { PDFFont } from 'pdf-lib';

/**
 * Measures text width in PDF points
 * @param text Text to measure
 * @param font PDF font object
 * @param size Font size in points
 * @returns Width in PDF points
 */
export function measureText(text: string, font: PDFFont, size: number): number {
  return font.widthOfTextAtSize(text, size);
}

/**
 * Wraps text to fit within specified width
 * @param text Text to wrap
 * @param font PDF font object
 * @param size Font size
 * @param maxWidth Maximum width in points
 * @returns Array of lines
 */
export function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = measureText(testLine, font, size);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Calculates vertical spacing between text elements
 * @param fontSize Font size in points
 * @param lineHeight Multiplier for line height
 * @returns Spacing in points
 */
export function calculateVerticalSpacing(fontSize: number, lineHeight = 1.2): number {
  return fontSize * lineHeight;
}
