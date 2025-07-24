import { TaxStrategyData } from './taxReportTypes';
import type { PdfSection } from './pdfTypes';
import TaxStrategyDocument, { 
  ExecutiveSummary,
  StrategyList, 
  ImplementationRoadmap,
  ComplianceCalendar 
} from '../components/PdfComponents/TaxStrategyDocument';
import React from 'react';

/**
 * Generates a professional tax strategy PDF from JSON data
 * @param strategyData Complete tax strategy analysis data
 * @returns React-PDF document element
 */
export const generatePdfDocument = (strategyData: TaxStrategyData): React.ReactElement => {
  const { summary, strategies, roadmap, deadlines } = strategyData;
  
  return React.createElement(
    TaxStrategyDocument,
    {
      children: [
        React.createElement(ExecutiveSummary, { data: summary, key: 'summary' }),
        React.createElement(StrategyList, {
          items: strategies,
          key: 'strategies'
        }),
        React.createElement(ImplementationRoadmap, {
          milestones: roadmap,
          key: 'roadmap'
        }),
        React.createElement(ComplianceCalendar, { deadlines, key: 'calendar' })
      ]
    }
  );
};

/**
 * Converts JSON data to PDF sections
 * @param jsonData Parsed JSON data
 * @returns Array of PDF sections
 */
export const processJsonToPdfSections = (jsonData: TaxStrategyData): PdfSection[] => {
  const sections: PdfSection[] = [];
  
  // Add summary section as text
  if (jsonData.summary) {
    const summaryText = [
      `Company: ${jsonData.summary.companyName}`,
      `Effective Tax Rate: ${jsonData.summary.effectiveTaxRate}%`,
      `Industry Benchmark: ${jsonData.summary.industryBenchmark}%`,
      `Potential Savings: $${jsonData.summary.potentialSavings}`,
      `Implementation Complexity: ${jsonData.summary.implementationComplexity}/10`
    ].join('\n');

    sections.push({
      type: 'text',
      title: 'Executive Summary',
      content: summaryText
    });
  }

  // Add strategies as text
  if (jsonData.strategies?.length) {
    const strategyText = jsonData.strategies.map(strat => 
      `• ${strat.name}: Save $${strat.savings} (${strat.complexity})\n  ${strat.steps.join('\n  ')}`
    ).join('\n\n');

    sections.push({
      type: 'text',
      title: 'Tax Strategies',
      content: strategyText
    });
  }

  // Add roadmap as text
  if (jsonData.roadmap?.length) {
    const roadmapText = jsonData.roadmap.map(step => 
      `- ${step.quarter}:\n  ${step.actions.join('\n  ')}`
    ).join('\n\n');

    sections.push({
      type: 'text',
      title: 'Implementation Roadmap',
      content: roadmapText
    });
  }

  return sections;
};
