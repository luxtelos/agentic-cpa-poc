import React, { useState, useEffect } from 'react';
import { PdfGenerator } from './PdfGenerator';
import { TaxReportData } from '../lib/taxReportTypes';

// Sample data structure for demonstration
const sampleReportData: TaxReportData = {
  companyInfo: {
    name: "FAKE COMPANY",
    address: "FAKELAND ADDRESS HOLLYWOOD HILLS, WONDERLAND, CA 70012",
    ein: "90-9090901",
    taxYear: "2022",
    businessActivity: "Technology Consulting",
    naicsCode: "541512"
  },
  incomeSummary: [
    { description: "Gross Receipts", amount: "$3,385,490" },
    { description: "Returns and Allowances", amount: "$0" },
    { description: "Net Sales", amount: "$3,385,490" },
    { description: "Cost of Goods Sold", amount: "$2,666,701" },
    { description: "Gross Profit", amount: "$718,789" },
    { description: "Dividends and Inclusions", amount: "$131,175" },
    { description: "Total Income", amount: "$718,789" }
  ],
  deductions: [
    { description: "Salaries and Wages", amount: "$151,250" },
    { description: "Taxes and Licenses", amount: "$13,070" },
    { description: "Repairs and Maintenance", amount: "$87,190" },
    { description: "Other Deductions", amount: "$347,963" },
    { description: "Total Deductions", amount: "$588,141" }
  ],
  taxComputation: [
    { description: "Taxable Income", amount: "$718,789" },
    { description: "Total Tax Liability", amount: "$151,250" },
    { description: "Payments and Credits", amount: "$75,858" },
    { description: "Amount Owed", amount: "$75,392" }
  ],
  disclosures: [
    { 
      title: "Extensions", 
      content: "Form 7004 filed for automatic 6-month extension." 
    },
    { 
      title: "Ownership", 
      content: "100% owned by Felicity Jones (SSN: 007-01-0009)." 
    }
  ],
  recommendations: [
    { 
      description: "Amend Returns", 
      details: [
        "Correct discrepancies in other current liabilities ($19,392 beginning vs. $4,580 ending).",
        "Payroll tax liabilities reduced by $14,812."
      ] 
    }
  ],
  finalAssessment: "FAKE COMPANY owes $75,392 for tax year 2022."
};

const LandingPage: React.FC = () => {
  const [reportData, setReportData] = useState<TaxReportData | null>(null);
  
  useEffect(() => {
    // In a real app, this would fetch data from an API
    setReportData(sampleReportData);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Tax Optimization Report
        </h1>
        
        {reportData ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <PdfGenerator reportData={reportData} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg">Generating your tax report...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
