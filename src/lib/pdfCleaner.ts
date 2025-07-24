import type { TaxReport, Strategy } from './pdfTypes';

export function cleanTaxReport(report: TaxReport): TaxReport {
  // Clean strategies
  const cleanedStrategies = (report.strategies || []).map(strategy => ({
    ...strategy,
    title: strategy.title || 'Untitled Strategy',
    description: strategy.description?.replace(/undefined/g, '') || '',
    implementation: strategy.implementation || '',
    impact: strategy.impact || '',
    savings: strategy.savings || 0
  }));

  // Clean tables
  const cleanTable = (table: string[][]): string[][] => {
    return table?.map(row => 
      row.map(cell => 
        (cell || '').toString()
          .replace(/undefined/g, '')
          .replace(/\s+/g, ' ')
          .trim()
      )
    ).filter(row => row.some(cell => cell)) || [];
  };

  return {
    ...report,
    strategies: cleanedStrategies,
    executiveSummary: {
      ...report.executiveSummary,
      industry: report.executiveSummary.industry || '',
      currentTaxRate: report.executiveSummary.currentTaxRate || 0,
      projectedSavings: report.executiveSummary.projectedSavings || 0,
      benchmarkingNotes: report.executiveSummary.benchmarkingNotes || ''
    },
    companyInfo: Object.fromEntries(
      Object.entries(report.companyInfo || {}).map(([k, v]) => [k, v?.toString() || ''])
    )
  };
}

export function validatePdfContent(content: string): string {
  return content
    .replace(/undefined/g, '')
    .replace(/\n\s*\n/g, '\n\n') // Remove extra empty lines
    .replace(/\|(\s*)undefined(\s*)\|/g, '|$1-$2|') // Replace undefined in tables
    .trim();
}
