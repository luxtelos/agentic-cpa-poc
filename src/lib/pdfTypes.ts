export interface Strategy {
  id?: string;
  title: string;
  description: string;
  impact: string;
  implementation: string;
  savings: number;
  implementationDate?: string;
  complexity?: string;
  implementationSteps?: string;
  riskLevel?: string;
}

export interface PdfTableData {
  title?: string;
  headers: string[];
  rows: string[][];
}

export interface TaxReport {
  title: string;
  companyInfo: Record<string, string>;
  executiveSummary: {
    industry: string;
    revenue: number;
    currentTaxRate: number;
    projectedSavings: number;
    benchmarkingNotes?: string;
  };
  strategies: Strategy[];
  roadmapTable?: string | PdfTableData;
  complianceCalendarTable?: string | PdfTableData;
  projectedSavingsTable?: string | PdfTableData;
  riskAssessment?: string;
  legalDisclaimer?: string;
}

export type PdfSectionType = 'text' | 'table' | 'section';
import { TaxStrategyData } from './taxReportTypes';

export type PdfSection = {
  type: PdfSectionType;
  content: string | string[][] | TaxStrategyData | Strategy[];
  title?: string;
};

export interface PdfGenerationServiceProps {
  sections?: PdfSection[];
  report?: TaxReport;
  watermark?: string;
  isDraft?: boolean;
}
