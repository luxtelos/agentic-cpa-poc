import { z } from 'zod';

export const StrategySchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  savings: z.number().min(0, 'Savings must be positive'),
  timeline: z.string().min(1, 'Timeline is required'),
  complexity: z.number().min(1).max(10),
  steps: z.array(z.string().min(1, 'Step cannot be empty')),
  documents: z.array(z.string()).optional(),
  deadline: z.string().optional(),
  frequency: z.string().optional(),
  risk: z.string().optional().default('Medium')
});

export const RoadmapItemSchema = z.object({
  quarter: z.string().min(1, 'Quarter is required'),
  actions: z.string().min(1, 'Actions description is required')
    .max(500, 'Actions description too long'),
  deadlines: z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/, 
    'Deadline must be in YYYY-MM-DD format'
  )
});

export const TaxReportSchema = z.object({
  executiveSummary: z.object({
    entityType: z.string(),
    industry: z.string(),
    revenue: z.number(),
    taxableIncome: z.number(),
    currentTaxRate: z.number(),
    projectedSavings: z.number(),
    benchmarkingNotes: z.string().optional()
  }),
  strategies: z.array(StrategySchema),
  roadmap: z.array(RoadmapItemSchema),
  complianceCalendar: z.array(z.object({
    month: z.string(),
    requirement: z.string()
  })),
  followUpRequirements: z.array(z.string()),
  tables: z.array(z.array(z.string())).optional()
});

export type Strategy = z.infer<typeof StrategySchema>;
export type RoadmapItem = z.infer<typeof RoadmapItemSchema>;
export type TaxReport = z.infer<typeof TaxReportSchema> & {
  roadmapTable?: string;
  complianceCalendarTable?: string;
  projectedSavingsTable?: string;
  riskAssessment?: string;
  legalDisclaimer?: string;
};

export interface PdfTableData {
  headers: string[];
  rows: (string | number)[][]; 
  colWidths?: number[];
  mergedCells?: [number, number][];
}

// Helper function to validate and clean report data
export const validateTaxReport = (data: unknown): TaxReport => {
  const result = TaxReportSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(err => 
      `${err.path.join('.')}: ${err.message}`
    ).join('\n');
    console.error('Invalid tax report data:\n', errors);
    throw new Error(`Invalid tax report data:\n${errors}`);
  }

  // Additional validation for roadmap table
  interface ReportDataWithTable {
    roadmapTable?: string;
  }
  
  if (data && typeof data === 'object' && 'roadmapTable' in data) {
    const table = (data as ReportDataWithTable).roadmapTable;
    if (table && typeof table !== 'string') {
      throw new Error('roadmapTable must be a string');
    }
  }

  return {
    ...result.data,
    roadmapTable: (data as ReportDataWithTable)?.roadmapTable
  };
};
