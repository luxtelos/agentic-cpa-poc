import { PdfGenerator } from '../components/PdfGenerator';

const testMarkdown = `
# Tax Optimization Report

## Summary
- Total savings identified: **$12,450**
- Recommended strategies: 3
- Implementation timeframe: Q3 2025

<!-- pagebreak -->

## Detailed Analysis
| **Metric** | **Value** | **Trend** |
|--------|-------|-------|
| Depreciation | $4,200 | ▲ 12% |
| R&D Credits | $3,750 | ● |
| State Credits | $2,100 | ▲ 5% |

## Next Steps
1. File Form 6765 for R&D credit
2. Adjust depreciation schedule
3. Submit state incentive applications
`;

export const PdfTestPage = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">PDF Generation Test</h1>
      <div className="mb-4 p-4 border rounded">
<PdfGenerator 
  data={testMarkdown}
  showPreview={true}
/>
      </div>
      <div className="text-sm text-gray-500 mt-2">
        Note: The new PDF generator produces higher quality documents with:
        <ul className="list-disc pl-5 mt-1">
          <li>Proper table formatting</li>
          <li>Consistent typography</li>
          <li>Native PDF features</li>
        </ul>
      </div>
    </div>
  );
};
