import { sanitizePdfContent } from '../lib/utils';

export class PdfService {
  static async fetchPdf(content: string): Promise<Blob> {
    if (!import.meta.env.VITE_PDF_API_URL) {
      throw new Error('PDF_API_URL is not configured');
    }

    const cleanContent = sanitizePdfContent(content);
    
    const response = await fetch(
      import.meta.env.VITE_PDF_API_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'CORS': '*'
        },
        body: cleanContent
      }
    );

    if (!response.ok) {
      throw new Error(`PDF generation failed: ${response.statusText}`);
    }

    return await response.blob();
  }

  static createViewerUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  static download(blob: Blob, filename: string = 'report.pdf'): void {
    const url = this.createViewerUrl(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    // Clean up after download completes (1s delay is conservative)
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1000);
  }
}
