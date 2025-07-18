import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

interface PdfViewerProps {
  pdfData: Uint8Array;
  className?: string;
}

export function PdfViewer({ pdfData, className = '' }: PdfViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    try {
      if (!pdfData || pdfData.length === 0) {
        throw new Error('Empty PDF data received');
      }

      // Validate PDF header
      const header = Array.from(pdfData.slice(0, 4)).map(b => b.toString(16)).join('');
      if (header !== '25504446') { // %PDF in hex
        throw new Error('Invalid PDF format');
      }

      // Clean up previous URL if exists
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load PDF');
      console.error('PDF loading error:', err);
    }

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfData]);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'tax-optimization-report.pdf';
    link.click();
  };

  if (error) {
    return (
      <div className={`border rounded-lg bg-background p-4 text-center ${className}`}>
        <p className="text-red-500">{error}</p>
        {pdfUrl && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDownload}
            className="mt-2"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        )}
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className={`border rounded-lg bg-background p-4 text-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading PDF...</p>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg overflow-hidden bg-background ${className}`}>
      <div className="flex justify-end p-2 bg-muted">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      <div className="overflow-x-auto w-full h-full">
        <iframe
          src={pdfUrl}
          width="100%"
          height="100%"
          className="min-h-[600px]"
          title="PDF Preview"
          style={{ 
            minWidth: '842px', // Match PDF page width
            width: '100%',
            maxWidth: 'none'
          }}
        />
      </div>
    </div>
  );
}
