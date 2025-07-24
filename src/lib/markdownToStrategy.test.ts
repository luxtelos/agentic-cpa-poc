import { parseMarkdownToStrategy } from './markdownToStrategy'
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'

describe('markdownToStrategy', () => {
  it('should parse basic markdown structure', () => {
    const markdown = `
## Executive Summary
- Company: Test Corp
- Effective Tax Rate: 21%

## Strategies
1. **Deferral**: Save $10,000 (Complexity: Medium)
   - Step 1: Document transactions
   - Step 2: File Form 7004

## Roadmap
- Q1 2023:
  - Implement deferral strategy
  - Deadline: 2023-03-31
`

    const result = parseMarkdownToStrategy(markdown)
    expect(result.summary.companyName).toBe('Test Corp')
    expect(result.strategies[0].name).toBe('Deferral')
    expect(result.roadmap[0].quarter).toBe('Q1 2023')
  })

  it('should handle tables in markdown', () => {
    const markdown = `
| Quarter      | Action          | Deadline     |
|--------------|-----------------|-------------|
| Q2 2023      | File amendment  | 2023-06-30  |
`
    const result = parseMarkdownToStrategy(markdown)
    expect(result.roadmap[0].actions).toContain('File amendment')
  })

  it('should parse sample input file', () => {
    const sample = readFileSync('public/sample_input.md', 'utf-8')
    const result = parseMarkdownToStrategy(sample)
    expect(result.summary.companyName).toBe('FAKE COMPANY')
    expect(result.strategies.length).toBeGreaterThan(0)
  })

  it('should parse deadlines section from list', () => {
    const markdown = `
## Deadlines
- **March**
  - Quarterly estimated payments
  - Form 941 filing
- **June**
  - Form 7004 extension
`
    const result = parseMarkdownToStrategy(markdown)
    expect(result.deadlines).toEqual([
      {
        month: 'March',
        requirements: [
          'Quarterly estimated payments',
          'Form 941 filing'
        ]
      },
      {
        month: 'June',
        requirements: [
          'Form 7004 extension'
        ]
      }
    ])
  })

  it('should parse deadlines section from table', () => {
    const markdown = `
## Deadlines
| Month  | Requirements |
|--------|--------------|
| March  | Quarterly estimated payments<br>Form 941 filing |
| June   | Form 7004 extension |
`
    const result = parseMarkdownToStrategy(markdown)
    expect(result.deadlines).toEqual([
      {
        month: 'March',
        requirements: [
          'Quarterly estimated payments',
          'Form 941 filing'
        ]
      },
      {
        month: 'June',
        requirements: [
          'Form 7004 extension'
        ]
      }
    ])
  })
})
