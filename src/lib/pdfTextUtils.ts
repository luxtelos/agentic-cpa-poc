import type { PDFFont, PDFPage } from 'pdf-lib';
import type { PdfSectionType } from './markdownProcessor';

export function measureText(page: PDFPage, text: string, font: PDFFont, size: number, maxWidth: number) {
  const width = font.widthOfTextAtSize(text, size);
  const height = size * 1.2; // Approximate line height
  return { width, height };
}

export function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/([\s\-/])/);
  const lines: string[] = [];
  let currentLine = '';
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (testWidth <= maxWidth || currentLine === '') {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

export function calculateVerticalSpacing(
  baseSpacing: number,
  contentHeight: number,
  type: PdfSectionType
): number {
  switch (type) {
    case 'heading':
      return baseSpacing + contentHeight * 2.0; // Increased spacing for headings
    case 'table':
      return baseSpacing + contentHeight * 1.5; // More table spacing
    case 'section':
      return baseSpacing + contentHeight * 2.5; // Extra spacing for key sections
    default:
      return baseSpacing + contentHeight * 1.2; // Slightly increased default
  }
}
