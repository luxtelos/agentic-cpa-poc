import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const MAX_LINES_PER_PAGE = 40;
const LINE_HEIGHT = 20;
const MARGIN = 50;

export async function generateCpuPdf(content: string) {
  const startTime = performance.now();
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  let currentPage = pdfDoc.addPage([595.28, 841.89]); // A4 size
  let lineCount = 0;
  let yPosition = 800;

  // Add title
  currentPage.drawText('TAX OPTIMIZATION REPORT', {
    x: MARGIN,
    y: yPosition,
    size: 20,
    font,
  });
  yPosition -= 40;
  lineCount += 2;

  // Process content in chunks
  const lines = content.split('\n');
  for (const line of lines) {
    if (lineCount >= MAX_LINES_PER_PAGE) {
      currentPage = pdfDoc.addPage([595.28, 841.89]);
      yPosition = 800;
      lineCount = 0;
    }

    if (line.trim()) {
      currentPage.drawText(line, {
        x: MARGIN,
        y: yPosition,
        size: 12,
        font,
      });
      yPosition -= LINE_HEIGHT;
      lineCount++;
    }
  }

  // Add footer with render time
  const renderTime = performance.now() - startTime;
  currentPage.drawText(`Render time: ${renderTime.toFixed(2)}ms`, {
    x: MARGIN,
    y: 30,
    size: 10,
    font,
  });

  return pdfDoc.save();
}
