import React, { useState, useMemo } from 'react';
import type { TaxReport } from '../lib/pdfTypes';
import { cleanTaxReportData } from '../lib/pdfUtils';
import { TaxReportDocument } from '../components/PdfComponents/TaxReportDocument';

interface PdfGeneratorHook {
  generate: (data: unknown) => TaxReport;
  document: JSX.Element | null;
  reportData: TaxReport | null;
}

export const usePdfGenerator = (): PdfGeneratorHook => {
  const [reportData, setReportData] = useState<TaxReport | null>(null);

  const generate = (data: unknown): TaxReport => {
    const cleanedData = cleanTaxReportData(data);
    setReportData(cleanedData);
    return cleanedData;
  };

  const document = useMemo(() => {
    return reportData ? React.createElement(TaxReportDocument, { report: reportData }) : null;
  }, [reportData]);

  return {
    generate,
    document,
    reportData
  };
};
