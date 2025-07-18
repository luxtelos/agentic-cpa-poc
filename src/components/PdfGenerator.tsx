import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { usePdfGenerator } from '../hooks/usePdfGenerator';
import { useEffect } from 'react';

interface PdfGeneratorProps {
  data: unknown;
  showPreview?: boolean;
}

export const PdfGenerator = ({ data, showPreview = true }: PdfGeneratorProps) => {
  const { generate, document, reportData } = usePdfGenerator();

  useEffect(() => {
    generate(data);
  }, [data, generate]);

  if (!reportData) return null;

  return (
    <div className="pdf-generator">
      {showPreview && (
        <PDFViewer style={{ width: '100%', height: '500px' }}>
          {document}
        </PDFViewer>
      )}
      <PDFDownloadLink
        document={document}
        fileName="tax-optimization-report.pdf"
        className="download-button"
      >
        {({ loading }) => (loading ? 'Preparing document...' : 'Download PDF')}
      </PDFDownloadLink>
    </div>
  );
};
