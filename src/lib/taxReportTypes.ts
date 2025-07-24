export interface CompanyInfo {
  name: string;
  address: string;
  ein: string;
  taxYear: string;
  businessActivity: string;
  naicsCode?: string;
}

export interface FinancialItem {
  description: string;
  amount: string;
}

export interface DisclosureItem {
  title: string;
  content: string;
}

export interface RecommendationItem {
  description: string;
  details: string[];
}

export interface TaxReportData {
  companyInfo: CompanyInfo;
  incomeSummary: FinancialItem[];
  deductions: FinancialItem[];
  taxComputation: FinancialItem[];
  disclosures: DisclosureItem[];
  recommendations: RecommendationItem[];
  finalAssessment: string;
}

export interface TaxStrategyData {
  summary: {
    companyName: string;
    effectiveTaxRate: number;
    industryBenchmark: number;
    potentialSavings: number;
    implementationComplexity: number;
  };
  strategies: Array<{
    name: string;
    savings: number;
    timeline: string;
    complexity: string;
    steps: string[];
    documentation: string[];
    deadline: string;
    risk: string;
    compliance: string;
  }>;
  roadmap: Array<{
    quarter: string;
    actions: string[];
    deadlines: string[];
  }>;
  deadlines: Array<{
    month: string;
    requirements: string[];
  }>;
}
