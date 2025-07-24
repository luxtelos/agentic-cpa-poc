import React, { useState, useEffect } from 'react';
import { extractReportContent } from '../lib/perplexityApi';
import { parseMarkdownToStrategy } from '../lib/markdownToStrategy';
import { PdfGenerator } from '../components/PdfGenerator';
import { TaxStrategyData } from '../lib/taxReportTypes';
import { validateTaxStrategyData } from '../lib/taxReportSchema';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';

// Example content provided by the user
const exampleContent = `{
  "summary": {
    "companyName": "FAKE COMPANY",
    "effectiveTaxRate": 21,
    "industryBenchmark": 18,
    "potentialSavings": 75000,
    "implementationComplexity": 3
  },
  "strategies": [
    {
      "name": "R&D Tax Credit",
      "savings": 45000,
      "timeline": "Q1 2023",
      "steps": [
        "Document qualifying activities",
        "Calculate credit amount",
        "File amended return"
      ]
    }
  ],
  "roadmap": [
    {
      "quarter": "Q1 2023",
      "actions": [
        "Implement R&D documentation",
        "File Form 6765"
      ],
      "deadlines": [
        "2023-03-15",
        "2023-03-15"
      ]
    }
  ],
  "deadlines": [
    {
      "month": "March",
      "requirements": [
        "Quarterly estimated payments",
        "Form 941 filing"
      ]
    }
  ]
}`;

export function PdfTestPage() {
  const [inputContent, setInputContent] = useState<string>(exampleContent);
  const [extractedContent, setExtractedContent] = useState<string>('');
  const [strategyData, setStrategyData] = useState<TaxStrategyData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  
  // Extract content when input changes
  useEffect(() => {
    const extracted = extractReportContent(inputContent);
    setExtractedContent(extracted);
  }, [inputContent]);

  const handleGenerate = async () => {
    if (!inputContent.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      let strategy: TaxStrategyData;
      
      // Check if input is JSON
      if (inputContent.trim().startsWith('{')) {
        const jsonData = JSON.parse(extractedContent);
        strategy = validateTaxStrategyData(jsonData);
      } 
      // Otherwise treat as markdown
      else {
        strategy = parseMarkdownToStrategy(extractedContent);
        // Still validate against schema
        strategy = validateTaxStrategyData(strategy);
      }
      
      setStrategyData(strategy);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate report data');
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">PDF Generation Test</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium">Input Content</label>
              <div className="text-sm text-gray-500">
                {inputContent.trim().startsWith('{') ? 'JSON Mode' : 'Markdown Mode'}
              </div>
            </div>
            <Textarea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              rows={15}
              placeholder={`Enter content for PDF generation (JSON or Markdown format)...\n\nExample Markdown:\n## Executive Summary\n- Company: Test Corp\n- Effective Tax Rate: 21%\n\n## Strategies\n1. **Deferral**: Save $10,000`}
              className="w-full font-mono text-sm"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">{`Extracted Content (after <think> tags)`}</label>
            <div className="border rounded p-4 bg-gray-50 text-sm font-mono whitespace-pre-wrap min-h-[200px] max-h-[300px] overflow-y-auto">
              {extractedContent || <span className="text-gray-400">Extracted content will appear here</span>}
            </div>
          </div>
          
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate PDF'}
          </Button>
          
          {error && <p className="text-red-500">{error}</p>}
        </div>
        
        <div>
          <label className="block mb-2 font-medium">PDF Preview</label>
          <div className="border rounded-lg overflow-hidden">
          {strategyData && (
            <PdfGenerator 
              strategyData={strategyData} 
              showPreview={true}
            />
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
