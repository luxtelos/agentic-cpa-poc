import { useState, useRef } from 'react';
import { PdfService } from '@/services/pdfService';
import { toast } from '@/components/ui/use-toast';
import { Download, FileText } from 'lucide-react';

interface PdfHandlerProps {
  content: string;
  defaultAction?: 'view' | 'download';
  className?: string;
}

export const PdfHandler = ({
  content,
  defaultAction = 'view',
  className = ''
}: PdfHandlerProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const pdfBlobRef = useRef<Blob | null>(null);

  const handlePdf = async () => {
    if (!content.trim()) {
      toast({
        title: 'Invalid Content',
        description: 'Please provide content for PDF generation',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const blob = await PdfService.fetchPdf(content);
      pdfBlobRef.current = blob; // Store blob for download
      const url = PdfService.createViewerUrl(blob);
      
      if (defaultAction === 'download') {
        PdfService.download(blob);
      } else {
        setPdfUrl(url);
      }
    } catch (error) {
      toast({
        title: 'PDF Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate PDF',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (pdfBlobRef.current) {
      PdfService.download(pdfBlobRef.current);
      toast({
        title: 'PDF Downloaded',
        description: 'Tax report saved to your downloads folder',
      });
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex gap-3">
        <button
          onClick={handlePdf}
          disabled={isLoading}
          className="inline-flex items-center gap-x-2 rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 transition-all duration-200"
        >
          <FileText className="h-4 w-4" />
          {isLoading ? 'Generating...' : 'Generate PDF'}
        </button>
        
        {pdfUrl && (
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-x-2 rounded-md bg-success-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-success-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success-600 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        )}
      </div>
      
      {pdfUrl && (
        <iframe 
          src={pdfUrl}
          className="w-full h-[500px] border rounded-lg"
          title="PDF Preview"
        />
      )}
    </div>
  );
};
