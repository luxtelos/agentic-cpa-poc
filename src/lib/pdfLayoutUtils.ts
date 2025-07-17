import { PDFPage, PDFFont } from 'pdf-lib'

export interface TextDimensions {
  width: number
  height: number
  lineCount: number
}

export function measureText(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): TextDimensions {
  // Handle newlines by splitting into paragraphs first
  const paragraphs = text.split('\n');
  let maxLineWidth = 0;
  let totalHeight = 0;
  let totalLines = 0;

  paragraphs.forEach(paragraph => {
    // Skip empty paragraphs
    if (!paragraph.trim()) return;

    // Measure each paragraph
    const words = paragraph.split(' ');
    let line = '';
    let paragraphLines = 1;
    let paragraphMaxWidth = 0;

    words.forEach(word => {
      const testLine = line ? `${line} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, size);
      
      if (testWidth > maxWidth) {
        paragraphLines++;
        paragraphMaxWidth = Math.max(paragraphMaxWidth, font.widthOfTextAtSize(line, size));
        line = word;
      } else {
        line = testLine;
      }
    });

    paragraphMaxWidth = Math.max(paragraphMaxWidth, font.widthOfTextAtSize(line, size));
    maxLineWidth = Math.max(maxLineWidth, paragraphMaxWidth);
    totalLines += paragraphLines;
    totalHeight += paragraphLines * size * 1.2;
  });

  return {
    width: maxLineWidth,
    height: totalHeight,
    lineCount: totalLines
  };
}

export function calculateVerticalSpacing(
  margin: number,
  contentHeight: number,
  type?: 'heading' | 'paragraph' | 'table' | 'list'
): number {
  // Type-specific spacing with minimum values
  const typeSettings = {
    heading: { multiplier: 2.0, min: 30 },
    paragraph: { multiplier: 1.8, min: 20 },
    table: { multiplier: 2.2, min: 25 }, 
    list: { multiplier: 1.8, min: 20 },
    default: { multiplier: 1.5, min: 15 }
  };

  const settings = typeSettings[type || 'default'];
  const calculated = margin + (contentHeight * settings.multiplier);
  return Math.max(calculated, settings.min);
}

export function shouldPageBreak(currentY: number, contentHeight: number, pageHeight: number): boolean {
  // Add 20mm buffer for footer space
  return (currentY + contentHeight) > (pageHeight - 20); 
}
