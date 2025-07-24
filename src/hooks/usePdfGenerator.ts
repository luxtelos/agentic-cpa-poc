import { PdfService } from '../services/pdfService';
import { toast } from '../components/ui/use-toast';

export const usePdfGenerator = () => {
  const generatePdf = async (content: string) => {
    try {
      const blob = await PdfService.fetchPdf(content);
      return PdfService.createViewerUrl(blob);
    } catch (error) {
      toast({
        title: 'PDF Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate PDF',
        variant: 'destructive'
      });
      throw error;
    }
  };

  return { generatePdf };
};
