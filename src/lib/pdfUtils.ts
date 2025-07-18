import { Strategy, RoadmapItem, TaxReport, TaxReportSchema } from './pdfTypes';
import type { z } from 'zod';

type PartialTaxReport = z.infer<typeof TaxReportSchema> | Record<string, never>;

export const getDefaultStrategy = (): Strategy => ({
  id: crypto.randomUUID(),
  title: 'Unnamed Strategy',
  description: '',
  savings: 0,
  timeline: 'Not specified',
  complexity: 5,
  steps: ['Action not specified'],
  documents: [],
  deadline: '',
  frequency: ''
});

export const getDefaultRoadmapItem = (): RoadmapItem => ({
  quarter: '',
  actions: 'No actions planned',
  deadlines: 'No deadline set'
});

export const cleanTaxReportData = (data: unknown): TaxReport => {
  // First validate against schema
  const result = TaxReportSchema.safeParse(data);
  if (!result.success) {
    console.warn('Invalid tax report data, using defaults:', result.error);
    data = {};
  } else {
    data = result.data;
  }

  const safeData = data as PartialTaxReport;
  return {
    executiveSummary: {
      entityType: safeData.executiveSummary?.entityType || 'C-Corporation',
      industry: safeData.executiveSummary?.industry || 'Not specified',
      revenue: safeData.executiveSummary?.revenue || 0,
      taxableIncome: safeData.executiveSummary?.taxableIncome || 0,
      currentTaxRate: Math.min(Math.max(safeData.executiveSummary?.currentTaxRate || 0, 0), 100),
      projectedSavings: Math.max(safeData.executiveSummary?.projectedSavings || 0, 0)
    },
    strategies: safeData.strategies?.map(s => ({
      ...getDefaultStrategy(),
      ...s
    })) || [getDefaultStrategy()],
    roadmap: safeData.roadmap?.map(r => ({
      ...getDefaultRoadmapItem(),
      ...r
    })) || [getDefaultRoadmapItem()],
    complianceCalendar: safeData.complianceCalendar || [],
    followUpRequirements: safeData.followUpRequirements || []
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
