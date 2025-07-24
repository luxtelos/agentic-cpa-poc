import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { useEffect, useState } from 'react';
import { generatePdfDocument } from '../lib/pdfGenerationService';
import { TaxStrategyData } from '../lib/taxReportTypes';

interface PdfGeneratorProps {
  strategyData: TaxStrategyData;
  showPreview?: boolean;
}

export const PdfGenerator = ({ strategyData, showPreview = true }: PdfGeneratorProps) => {
  const [pdfDocument, setPdfDocument] = useState<React.ReactElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (strategyData) {
      setIsGenerating(true);
      try {
        // Use the service to generate the PDF document
        const doc = generatePdfDocument(strategyData);
        setPdfDocument(doc);
        setError(null);
      } catch (e) {
        setError('Failed to generate PDF document');
        console.error(e);
      } finally {
        setIsGenerating(false);
      }
    }
  }, [strategyData]);

  if (isGenerating) {
    return <div>Generating PDF document...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="pdf-generator">
      {showPreview && pdfDocument && (
        <PDFViewer style={{ width: '100%', height: '500px' }}>
          {pdfDocument}
        </PDFViewer>
      )}
      {pdfDocument && (
        <PDFDownloadLink
          document={pdfDocument}
          fileName="tax-optimization-report.pdf"
          className="download-button"
        >
          {({ loading }) => (loading ? 'Preparing document...' : 'Download PDF')}
        </PDFDownloadLink>
      )}
    </div>
  );
};
