import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'
import type { Root, Heading, Table, List } from 'mdast'
import { VFile } from 'vfile'
import { TaxStrategyData } from './taxReportTypes'
import { validateTaxStrategyData } from './taxReportSchema'
import { cleanMarkdown } from './cleanMarkdown'

interface ProcessingState {
  currentSection?: string
  summary: Partial<TaxStrategyData['summary']>
  strategies: TaxStrategyData['strategies']
  roadmap: TaxStrategyData['roadmap']
  deadlines: TaxStrategyData['deadlines']
}

const DEFAULT_IMPLEMENTATION_COMPLEXITY = 3;

export function parseMarkdownToStrategy(markdown: string): TaxStrategyData {
  try {
    // First clean the markdown to remove any non-content blocks
    const cleanedMarkdown = cleanMarkdown(markdown)
      .replace(/<think>[\s\S]*?<\/think>/g, '') // Remove think blocks
      .replace(/^#+\s*Executive Summary[^#]*/i, '') // Remove executive summary section
    
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkTaxStrategy)

    const vfile = new VFile({ value: cleanedMarkdown })
    const tree = processor.parse(vfile)
    processor.runSync(tree, vfile)
    const state = vfile.data?.state as ProcessingState | undefined
    
    if (!state) {
      throw new Error('Failed to process markdown - no state generated')
    }

    return validateTaxStrategyData({
      summary: {
        companyName: state.summary.companyName || 'Unknown Company',
        effectiveTaxRate: state.summary.effectiveTaxRate || 0,
        industryBenchmark: state.summary.industryBenchmark || 0,
        potentialSavings: state.summary.potentialSavings || 0,
        implementationComplexity: state.summary.implementationComplexity || DEFAULT_IMPLEMENTATION_COMPLEXITY
      },
      strategies: state.strategies || [],
      roadmap: state.roadmap || [],
      deadlines: state.deadlines || []
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid tax strategy data')) {
      throw new Error(`Markdown parsing validation failed: ${error.message}`)
    }
    
    return {
      summary: {
        companyName: 'Unknown Company',
        effectiveTaxRate: 0,
        industryBenchmark: 0,
        potentialSavings: 0,
        implementationComplexity: DEFAULT_IMPLEMENTATION_COMPLEXITY
      },
      strategies: [],
      roadmap: [],
      deadlines: []
    }
  }
}

function remarkTaxStrategy() {
  return (tree: Root, file: VFile) => {
    const getText = (node: { type: string; children?: Array<{type: string, value?: string}> }): string => {
      let value = ''
      visit(node, (child: {type: string, value?: string}) => {
        if (child.type === 'text' && child.value) value += child.value
      })
      return value
    }

    const state: ProcessingState = {
      summary: { 
        companyName: 'Unknown Company',
        effectiveTaxRate: 0,
        industryBenchmark: 0,
        potentialSavings: 0,
        implementationComplexity: DEFAULT_IMPLEMENTATION_COMPLEXITY
      },
      strategies: [],
      roadmap: [],
      deadlines: []
    }
    
    file.data = file.data || {}
    file.data.state = state

    visit(tree, (node, index, parent) => {
      if (node.type === 'heading') {
        const heading = node as Heading
        const text = heading.children
          .filter(child => child.type === 'text')
          .map(child => child.value)
          .join('')
        state.currentSection = text.toLowerCase()
      }
      else if (node.type === 'text') {
        const text = node.value
        if (state.currentSection?.includes('summary')) {
          // Handle company name in exact sample format
          const companyMatch = text.match(/\*\*Legal Name\*\*:\s*([^\n]+)/i)
          if (companyMatch) {
            state.summary.companyName = companyMatch[1].trim()
          }
          // Fallback to other formats if needed
          else {
            const fallbackMatch = text.match(/(?:Company|Legal Name):\s*([^\n]+)/i)
            if (fallbackMatch) {
              state.summary.companyName = fallbackMatch[1].trim()
            }
          }

          // Parse other summary fields
          const rateMatch = text.match(/effective tax rate:\s*([\d.]+)%/i)
          if (rateMatch) state.summary.effectiveTaxRate = parseFloat(rateMatch[1])
          
          const savingsMatch = text.match(/potential savings:\s*\$\s*([\d,]+)/i)
          if (savingsMatch) {
            state.summary.potentialSavings = parseFloat(savingsMatch[1].replace(/,/g, ''))
          }
        }
      }
      else if (node.type === 'list') {
        const list = node as List
        if (state.currentSection?.toLowerCase().includes('deadlines')) {
          list.children.forEach(item => {
            const monthText = getText(item)
            const monthMatch = monthText.match(/\*\*(.*?)\*\*/)
            if (monthMatch) {
              const requirements = item.children
                .filter(child => child.type === 'list')
                .flatMap(sublist => sublist.children)
                .flatMap(li => {
                  const text = getText(li);
                  return text.split('\n')
                    .map(s => s.replace(/^-/, '').trim())
                    .filter(Boolean);
                });
              
              state.deadlines.push({
                month: monthMatch[1],
                requirements
              })
            }
          })
        }
        else if (state.currentSection?.toLowerCase().includes('strategies')) {
          list.children.forEach(item => {
            const headerText = getText(item)
            // Match both bolded strategy names and section headers
            const nameMatch = headerText.match(/\*\*(.*?)\*\*:?\s*-\s*(.*)/) || 
                           headerText.match(/^#+\s*(.*?)\n/) ||
                           headerText.match(/\d+\.\s*(.*)/)
            
            if (nameMatch) {
              const strategyName = nameMatch[1] || nameMatch[2]
              const strategyDesc = nameMatch[2] ? nameMatch[2].trim() : ''
              
              state.strategies.push({
                name: strategyName,
                savings: headerText.match(/save\s*\$?\s*([\d,]+)/i)?.[1] ? 
                  parseFloat(headerText.match(/save\s*\$?\s*([\d,]+)/i)[1].replace(/,/g, '')) : 0,
                timeline: headerText.match(/timeline:\s*([\w\s]+)/i)?.[1] || '6 months',
                complexity: headerText.match(/complexity:\s*(\w+)/i)?.[1] || 'Medium',
                steps: item.children
                  .filter(child => child.type === 'list')
                  .flatMap(sub => (sub as List).children)
                  .map(li => getText(li).trim())
                  .filter(Boolean),
                documentation: [],
                deadline: headerText.match(/deadline:\s*([\w\s,]+)/i)?.[1] || '',
                risk: headerText.match(/risk:\s*(\w+)/i)?.[1] || 'Medium',
                compliance: headerText.match(/compliance:\s*(\w+)/i)?.[1] || 'Required'
              })
            }
          })
        }
      }
      else if (node.type === 'table') {
        const table = node as Table
        const rows = table.children.map(row => 
          row.children.map(cell => {
            const parts: string[] = []
            visit(cell, (child) => {
              if (child.type === 'text') parts.push(child.value)
              if (child.type === 'break') parts.push('\n')
            })
            return parts.join('').trim()
          })
        )
        
        if (rows.length === 0) return
        
        const headers = rows[0].map(h => h.toLowerCase())
        const dataRows = rows.slice(1)
        
        if (state.currentSection?.includes('deadlines')) {
          const monthIdx = headers.findIndex(h => h.includes('month'))
          const reqIdx = headers.findIndex(h => h.includes('requirement'))
          
          if (monthIdx >= 0 && reqIdx >= 0) {
            dataRows.forEach(row => {
              const month = row[monthIdx]
              const requirements = row[reqIdx]?.split('\n').filter(Boolean)
              if (month && requirements?.length) {
                state.deadlines.push({ month, requirements })
              }
            })
          }
        }
      }
    })
  }
}
