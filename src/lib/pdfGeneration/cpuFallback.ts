import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const LINE_HEIGHT = 20;
const MARGIN = 50;

export async function generateCpuPdf(content: string, maxLinesPerPage = 40): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    
    let yPosition = page.getHeight() - MARGIN;
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      if (i % maxLinesPerPage === 0 && i !== 0) {
        // Add new page when max lines reached
        yPosition = page.getHeight() - MARGIN;
        page = pdfDoc.addPage([595.28, 841.89]);
      }
      
      page.drawText(lines[i], {
        x: MARGIN,
        y: yPosition,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      yPosition -= LINE_HEIGHT;
    }

    const pdfBytes = await pdfDoc.save();
    return new Uint8Array(pdfBytes);
  } catch (error) {
    console.error('CPU PDF generation failed:', error);
    throw error;
  }
}
