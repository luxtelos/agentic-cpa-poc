import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { validatePdfStructure } from '../lib/pdfValidator';

interface PdfViewerProps {
  pdfUrl: string;
  className?: string;
}

export function PdfViewer({ pdfUrl, className = '' }: PdfViewerProps) {
  const [error, setError] = useState<string>('');
  const [isValidPdf, setIsValidPdf] = useState<boolean>(false);

  useEffect(() => {
    const validatePdf = async () => {
      if (!pdfUrl) {
        setError('No PDF URL provided');
        return;
      }

      try {
        const response = await fetch(pdfUrl);
        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        
        const validation = validatePdfStructure(bytes);
        if (!validation.isValid) {
          throw new Error(`Invalid PDF: ${validation.errors.join(', ')}`);
        }
        
        setIsValidPdf(true);
      } catch (err) {
        setError(err.message);
        setIsValidPdf(false);
      }
    };

    validatePdf();

    // Cleanup function
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

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
        <p className="text-red-500">PDF Validation Error: {error}</p>
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

  if (!isValidPdf) {
    return (
      <div className={`border rounded-lg bg-background p-4 text-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-600">Validating PDF...</p>
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
            minWidth: '842px',
            width: '100%',
            maxWidth: 'none'
          }}
        />
      </div>
    </div>
  );
}
