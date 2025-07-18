import type { TaxReport } from './pdfTypes';

export function cleanTaxReport(report: TaxReport): TaxReport {
  // Remove undefined values from strategies
  const cleanedStrategies = report.strategies.map(strategy => ({
    ...strategy,
    title: strategy.title || 'Untitled Strategy',
    description: strategy.description?.replace(/undefined/g, '') || '',
    steps: strategy.steps?.filter(step => step && step !== 'undefined').map(step => step.trim()) || [],
    documents: strategy.documents?.filter(doc => doc && doc !== 'undefined').map(doc => doc.trim()) || [],
    savings: strategy.savings || 0,
    risk: strategy.risk || 'Medium'
  }));

  // Clean up roadmap items
  const cleanedRoadmap = report.roadmap.map(item => ({
    quarter: item.quarter || '',
    actions: item.actions?.replace(/undefined/g, '') || '',
    deadlines: item.deadlines || ''
  }));

  // Fix table formatting
  const cleanTable = (table: string[][]): string[][] => {
    return table.map(row => 
      row.map(cell => 
        (cell || '').toString()
          .replace(/undefined/g, '')
          .replace(/\s+/g, ' ')
          .trim()
      )
    ).filter(row => row.some(cell => cell));
  };

  return {
    ...report,
    strategies: cleanedStrategies,
    roadmap: cleanedRoadmap,
    executiveSummary: {
      ...report.executiveSummary,
      industry: report.executiveSummary.industry || '',
      currentTaxRate: report.executiveSummary.currentTaxRate || 0,
      projectedSavings: report.executiveSummary.projectedSavings || 0
    },
    tables: report.tables ? cleanTable(report.tables) : [],
    followUpRequirements: report.followUpRequirements?.filter(req => req && req !== 'undefined').map(req => req.trim()) || []
  };
}

export function validatePdfContent(content: string): string {
  return content
    .replace(/undefined/g, '')
    .replace(/\n\s*\n/g, '\n\n') // Remove extra empty lines
    .replace(/\|(\s*)undefined(\s*)\|/g, '|$1-$2|') // Replace undefined in tables
    .trim();
}
