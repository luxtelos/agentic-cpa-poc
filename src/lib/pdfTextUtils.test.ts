import { PDFDocument, StandardFonts } from 'pdf-lib';
import { wrapText } from './pdfTextUtils';
import { describe, it, expect } from 'vitest';

describe('wrapText', () => {
  it('splits long paragraph into multiple lines without overflow', async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const text = 'This is a very long sentence that should wrap across multiple lines in the PDF document.';
    const maxWidth = 100;

    const lines = wrapText(text, font, 12, maxWidth);
    expect(lines.length).toBeGreaterThan(1);
    lines.forEach(line => {
      expect(font.widthOfTextAtSize(line, 12)).toBeLessThanOrEqual(maxWidth);
    });
  });

  it('wraps table cell text so columns do not overflow', async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const text = 'Cell with a lot of content that needs wrapping';
    const maxWidth = 80;

    const lines = wrapText(text, font, 11, maxWidth);
    expect(lines.length).toBeGreaterThan(1);
    lines.forEach(line => {
      expect(font.widthOfTextAtSize(line, 11)).toBeLessThanOrEqual(maxWidth);
    });
  });
});
