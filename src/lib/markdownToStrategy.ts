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

export function parseMarkdownToStrategy(markdown: string): TaxStrategyData {
  try {
    const cleanedMarkdown = cleanMarkdown(markdown)
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

    // Create minimal valid structure even if parsing fails
    const result = {
      summary: {
        companyName: state.summary.companyName || 'Unknown Company',
        effectiveTaxRate: state.summary.effectiveTaxRate || 0,
        industryBenchmark: state.summary.industryBenchmark || 0,
        potentialSavings: state.summary.potentialSavings || 0,
        implementationComplexity: state.summary.implementationComplexity || 3
      },
      strategies: state.strategies || [],
      roadmap: state.roadmap || [],
      deadlines: state.deadlines || []
    }

    // Validate against schema
    return validateTaxStrategyData(result)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid tax strategy data')) {
      // Rethrow validation errors with markdown context
      throw new Error(`Markdown parsing validation failed: ${error.message}`)
    }
    
    // Fallback to minimal valid structure
    return {
      summary: {
        companyName: 'Unknown Company',
        effectiveTaxRate: 0,
        industryBenchmark: 0,
        potentialSavings: 0,
        implementationComplexity: DEFAULT_IMPLEMENTATION_COMPLEXITY // Default to medium complexity
      },
      strategies: [],
      roadmap: [],
      deadlines: []
    }
  }
}

function remarkTaxStrategy() {
  return (tree: Root, file: VFile) => {
    const getText = (n: any): string => {
      let value = ''
      visit(n, (child) => {
        if (child.type === 'text') value += child.value
      })
      return value
    }
    const state: ProcessingState = {
      summary: { 
        companyName: 'Unknown Company',
        effectiveTaxRate: 0,
        industryBenchmark: 0,
        potentialSavings: 0,
        implementationComplexity: 3
      },
      strategies: [],
      roadmap: [],
      deadlines: []
    }
    
    file.data = file.data || {}
    file.data.state = state

    let currentText = ''

    visit(tree, (node, index, parent) => {
      if (node.type === 'heading') {
        const heading = node as Heading
        const text = heading.children
          .filter(child => child.type === 'text')
          .map(child => child.value)
          .join('')
        
        state.currentSection = text.toLowerCase()
        currentText = ''
      }
      else if (node.type === 'text') {
        currentText += node.value + '\n'
        
        // Parse summary details
        if (state.currentSection?.includes('summary')) {
          // Match company name from various formats in summary section
          if (state.currentSection?.toLowerCase().includes('summary')) {
            const companyMatch = currentText.match(/(?:Company|Legal Name):\s*\**([^\n]*)/i)
            if (companyMatch) {
              state.summary.companyName = companyMatch[1].replace(/\*/g, '').trim()
            }
          }
          
          const rateMatch = currentText.match(/effective tax rate:\s*([\d.]+)%/i)
          if (rateMatch) state.summary.effectiveTaxRate = parseFloat(rateMatch[1])
          
          const savingsMatch = currentText.match(/potential savings:\s*\$\s*([\d,]+)/i)
          if (savingsMatch) {
            state.summary.potentialSavings = parseFloat(savingsMatch[1].replace(/,/g, ''))
          }

          // Parse implementation complexity (1-5 scale)
          const complexityMatch = currentText.match(
            /implementation complexity:\s*([1-5]|low|medium|high)/i
          )
          if (complexityMatch) {
            const value = complexityMatch[1].toLowerCase()
            state.summary.implementationComplexity = 
              value === 'low' ? 1 :
              value === 'medium' ? 3 :
              value === 'high' ? 5 :
              parseInt(value)
          } else {
            // Default to medium complexity (3) if not specified
            state.summary.implementationComplexity = 3
          }
        }
      }
      else if (node.type === 'list') {
        const list = node as List
        if (state.currentSection?.toLowerCase().includes('deadlines') && parent?.type !== 'listItem') {
          list.children.forEach(item => {
            const header = item.children.find(c => c.type === 'paragraph')
            const monthText = header ? getText(header) : ''
            const monthMatch = monthText.match(/\*\*(.*?)\*\*/)
            
            if (monthMatch) {
              const requirements = item.children
                .filter(child => child.type === 'list')
                .flatMap(sublist => sublist.children)
                .map(li => getText(li).replace(/^-/, '').trim())
                .filter(r => r)
              
              state.deadlines.push({
                month: monthMatch[1],
                requirements
              })
            }
          })
        }
        else if (state.currentSection?.toLowerCase().includes('strategies') && parent?.type !== 'listItem') {
          list.children.forEach(item => {
            const header = item.children.find(c => c.type === 'paragraph')
            const headerText = header ? getText(header) : ''

            const nameMatch = headerText.match(/\*\*(.*?)\*\*/)
            const savingsMatch = headerText.match(/save\s*\$?\s*([\d,]+)/i)
            const complexityMatch = headerText.match(/complexity:\s*(\w+)/i)
            const timelineMatch = headerText.match(/timeline:\s*([\w\s]+)/i)
            const deadlineMatch = headerText.match(/deadline:\s*([\w\s,]+)/i)
            const riskMatch = headerText.match(/risk:\s*(\w+)/i)
            const complianceMatch = headerText.match(/compliance:\s*(\w+)/i)

            const steps = item.children
              .filter(child => child.type === 'list')
              .flatMap(sub => (sub as List).children)
              .map(li => getText(li).trim())
              .filter(Boolean)

            if (nameMatch) {
              state.strategies.push({
                name: nameMatch[1],
                savings: savingsMatch ? parseFloat(savingsMatch[1].replace(/,/g, '')) : 0,
                timeline: timelineMatch?.[1] || '6 months',
                complexity: complexityMatch?.[1] || 'Medium',
                steps,
                documentation: [],
                deadline: deadlineMatch?.[1] || '',
                risk: riskMatch?.[1] || 'Medium',
                compliance: complianceMatch?.[1] || 'Required'
              })
            }
          })
        }
        else if (state.currentSection?.toLowerCase().includes('roadmap') && parent?.type !== 'listItem') {
          list.children.forEach(item => {
            const header = item.children.find(c => c.type === 'paragraph')
            const quarter = header ? getText(header).replace(/:$/, '').trim() : ''
            const entry = state.roadmap.find(r => r.quarter === quarter) || { quarter, actions: [], deadlines: [] }
            item.children
              .filter(child => child.type === 'list')
              .flatMap(sub => (sub as List).children)
              .forEach(li => {
                const t = getText(li)
                const d = t.match(/^deadline:\s*(.*)/i)
                if (d) {
                  if (d[1]) entry.deadlines.push(d[1].trim())
                } else if (t) {
                  entry.actions.push(t)
                }
              })
            if (!state.roadmap.find(r => r.quarter === quarter) && quarter) {
              state.roadmap.push(entry)
            }
          })
        }
      }
      else if (node.type === 'table') {
        const table = node as Table
        const rows = table.children.map(row => 
          row.children.map(cell => {
            // Handle both text and line breaks in cells
            const parts = []
            visit(cell, (child) => {
              if (child.type === 'text') parts.push(child.value)
              if (child.type === 'break') parts.push('\n')
            })
            return parts.join('').trim()
          })
        )
        
        // Ensure we have at least a header row
        if (rows.length === 0) return
        
        const headers = rows[0].map(h => h.toLowerCase())
        const dataRows = rows.slice(1)
        
        // Handle roadmap table
        if (state.currentSection?.includes('roadmap')) {
          dataRows.forEach(row => {
            const quarterIdx = headers.findIndex(h => h.includes('quarter'))
            const actionIdx = headers.findIndex(h => h.includes('action'))
            const deadlineIdx = headers.findIndex(h => h.includes('deadline'))
            
            if (quarterIdx >= 0 && actionIdx >= 0) {
              const quarter = row[quarterIdx] || ''
              const action = row[actionIdx] || ''
              const deadline = deadlineIdx >= 0 ? row[deadlineIdx] : ''
              
              if (quarter && action) {
                if (!state.roadmap) state.roadmap = []
                
                const existing = state.roadmap.find(r => r.quarter === quarter)
                if (existing) {
                  if (!existing.actions) existing.actions = []
                  if (!existing.deadlines) existing.deadlines = []
                  existing.actions.push(action)
                  if (deadline) existing.deadlines.push(deadline)
                } else {
                  state.roadmap.push({
                    quarter,
                    actions: [action],
                    deadlines: deadline ? [deadline] : []
                  })
                }
              }
            }
          })
        }
        // Handle deadlines table
        else if (state.currentSection?.includes('deadlines')) {
          const monthIdx = headers.findIndex(h => h.includes('month'))
          const reqIdx = headers.findIndex(h => h.includes('requirement') || h.includes('requirements'))
          
          if (monthIdx >= 0 && reqIdx >= 0) {
            dataRows.forEach(row => {
              const month = row[monthIdx] || ''
              const requirements = row[reqIdx]?.split('\n').filter(r => r.trim()) || []
              
              if (month && requirements.length) {
                state.deadlines.push({
                  month,
                  requirements
                })
              }
            })
          }
        }
    }
    })
  }
}
