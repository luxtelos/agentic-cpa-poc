import { processMarkdownToPdfSections } from './markdownProcessor';
import { describe, it, expect } from 'vitest';

// Sample response matching the user's provided format
const SAMPLE_RESPONSE = `
# Comprehensive Tax Minimization Strategy Report

## Executive Summary
Content...

## Implementation Roadmap
| Quarter   | Actions                     | Deadlines    |
|-----------|-----------------------------|-------------|
| 2025-Q3   | Cost segregation study      | 2025-10-15  |

## Total Projected Savings
| Year | Projected Savings | 
|------|-------------------|
| 2025 | $28,500           |

## Compliance Calendar
| Month     | Requirements               |
|-----------|----------------------------|
| September | R&D documentation deadline |
`;

describe('markdownProcessor', () => {
  it('should process all sections from sample response', async () => {
    const sections = await processMarkdownToPdfSections(SAMPLE_RESPONSE);
    
    // Debug log processed sections
    console.debug('Processed sections:', sections);
    
    // Verify all expected sections are present
    expect(sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({type: 'heading', content: 'Comprehensive Tax Minimization Strategy Report'}),
        expect.objectContaining({type: 'heading', content: 'Executive Summary'}),
        expect.objectContaining({type: 'heading', content: 'Implementation Roadmap'}),
        expect.objectContaining({type: 'heading', content: 'Total Projected Savings'}),
        expect.objectContaining({type: 'heading', content: 'Compliance Calendar'})
      ])
    );

    // Verify tables are properly processed
    const roadmapTable = sections.find(s => 
      s.type === 'table' && s.content.includes('Cost segregation study')
    );
    expect(roadmapTable).toBeDefined();
    expect(roadmapTable?.content).toContain('| Quarter | Actions                     | Deadlines |');

    const savingsTable = sections.find(s =>
      s.type === 'table' && s.content.includes('$28,500')
    );
    expect(savingsTable).toBeDefined();
    expect(savingsTable?.content).toContain('| Year | Projected Savings |');

    const calendarTable = sections.find(s =>
      s.type === 'table' && s.content.includes('R&D documentation deadline')
    );
    expect(calendarTable).toBeDefined();
    expect(calendarTable?.content).toContain('| Month | Requirements               |');
  });

  it('should handle missing tables gracefully', async () => {
    const responseWithoutTables = `# Test Report\n\nSome content without tables`;
    const sections = await processMarkdownToPdfSections(responseWithoutTables);
    
    expect(sections).toHaveLength(2); // Heading + paragraph
    expect(sections[0].type).toBe('heading');
    expect(sections[1].type).toBe('paragraph');
  });
});
