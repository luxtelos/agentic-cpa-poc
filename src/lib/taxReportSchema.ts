import { z } from 'zod';
import { TaxStrategyData } from './taxReportTypes';

const strategySchema = z.object({
  name: z.string().min(1, "Strategy name is required"),
  savings: z.number().min(0, "Savings must be positive"),
  timeline: z.string().min(1, "Timeline is required"),
  steps: z.array(
    z.string().min(1, "Step cannot be empty")
  ).min(1, "At least one step is required"),
  documentation: z.array(z.string()).optional(),
  deadline: z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/, 
    "Deadline must be in YYYY-MM-DD format"
  ).optional(),
  risk: z.enum(["Low", "Medium", "High"]).default("Medium"),
  compliance: z.enum(["Required", "Optional", "Not Needed"]).default("Required")
});

const roadmapSchema = z.object({
  quarter: z.string().regex(
    /^Q[1-4] \d{4}$/,
    "Quarter must be in format Q1 2023"
  ),
  actions: z.array(
    z.string().min(1, "Action cannot be empty")
  ).min(1, "At least one action is required"),
  deadlines: z.array(
    z.string().regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Deadline must be in YYYY-MM-DD format"
    )
  )
});

const deadlineSchema = z.object({
  month: z.string().min(1, "Month is required"),
  requirements: z.array(
    z.string().min(1, "Requirement cannot be empty")
  ).min(1, "At least one requirement is required")
});

const summarySchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  effectiveTaxRate: z.number()
    .min(0, "Tax rate must be positive")
    .max(100, "Tax rate cannot exceed 100%"),
  industryBenchmark: z.number()
    .min(0, "Benchmark must be positive")
    .max(100, "Benchmark cannot exceed 100%"),
  potentialSavings: z.number()
    .min(0, "Savings must be positive"),
  implementationComplexity: z.number()
    .min(1, "Complexity must be at least 1")
    .max(5, "Complexity cannot exceed 5")
});

export const taxStrategySchema = z.object({
  summary: summarySchema,
  strategies: z.array(strategySchema),
  roadmap: z.array(roadmapSchema),
  deadlines: z.array(deadlineSchema)
});

export function validateTaxStrategyData(data: unknown): TaxStrategyData {
  try {
    return taxStrategySchema.parse(data) as TaxStrategyData;
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errorDetails = err.errors.map(e => 
        `${e.path.join('.')}: ${e.message}`
      ).join('\n');
      throw new Error(`Invalid tax strategy data:\n${errorDetails}`);
    }
    throw new Error('Invalid tax strategy data format');
  }
}
