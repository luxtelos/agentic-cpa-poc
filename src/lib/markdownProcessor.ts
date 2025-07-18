import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { Node } from 'unist'

interface HeadingNode extends Node {
  type: 'heading'
  depth: number
  children: { type: string; value: string }[]
}

interface ParagraphNode extends Node {
  type: 'paragraph'
  children: { type: string; value: string }[]
}

interface TableNode extends Node {
  type: 'table'
  children: {
    type: 'tableRow'
    children: {
      type: 'tableCell'
      children: { type: string; value: string }[]
    }[]
  }[]
}

interface ListNode extends Node {
  type: 'list'
  children: {
    type: 'listItem'
    children: {
      type: 'paragraph'
      children: { type: string; value: string }[]
    }[]
  }[]
}

interface RootNode extends Node {
  type: 'root'
  children: Node[]
}

export type PdfSectionType = 'heading' | 'paragraph' | 'table' | 'list' | 'section' | 'spacer';

export interface PdfSection {
  type: PdfSectionType
  content: string
  level?: number
  rows?: string[][]
  items?: string[]
  raw?: boolean // Flag for raw markdown content
  height?: number // Only for spacer type
}

export async function processMarkdownToPdfSections(rawContent: string): Promise<PdfSection[]> {
  // Preserve original content for debugging
  const originalContent = rawContent;
  
  // Extract content after </think> tag if present
  const content = rawContent.includes('</think>') 
    ? rawContent.split('</think>')[1].trim()
    : rawContent;

  // Debug log raw content
  console.debug('[MarkdownProcessor] Raw content length:', content.length);

  // Convert API response to markdown with strict formatting
  const markdown = content
    // Remove duplicate lines
    .split('\n')
    .filter((line, i, arr) => !line.trim() || arr.indexOf(line) === i)
    .join('\n')
    // Handle sections
    .replace(/## (.*?)\n/g, '## $1\n')
    // Validate key-value pairs (must have text before colon)
    .replace(/^: (.*)$/gm, '') // Remove standalone colons
    // Handle tables with strict formatting
    .replace(/\|(.+?)\|/g, (match) => match.replace(/\s+/g, ' ').trim())
    // Handle tables from TABULAR FORMAT blocks
    .replace(/TABULAR FORMAT:\n([\s\S]*?)(?=\n\n|$)/g, (_, table) => {
      const rows = table.split('\n').filter(Boolean);
      const parseRow = (row: string) => row.split('|').map(cell => cell.trim());
      const header = `| ${rows[0].split('|').join(' | ')} |\n|${rows[0].split('|').map(() => '---').join('|')}|`;
      const body = rows.slice(1).map(row => `| ${parseRow(row).join(' | ')} |`).join('\n');
      return `${header}\n${body}\n\n`;
    })
    // Handle lists from STEPS blocks
    .replace(/STEPS:\n([\s\S]*?)(?=\n\n|$)/g, (_, items) => 
      items.split('\n').filter(Boolean).map(item => `- ${item.trim()}`).join('\n') + '\n\n'
    )
    // Handle regular content
    .replace(/\n\n/g, '\n');

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)

  const tree = processor.parse(markdown)
  const ast = await processor.run(tree)
  const sections: PdfSection[] = []
  let previousWasParagraph = false

  // Process transformed AST nodes
  const processNode = (node: Node) => {
    // Add spacing after paragraphs before headings
    if (previousWasParagraph && node.type === 'heading') {
      sections.push({
        type: 'spacer',
        content: '',
        height: 1.5 // Line height multiplier
      })
    }
    previousWasParagraph = node.type === 'paragraph'
    switch (node.type) {
      case 'heading': {
        const headingNode = node as HeadingNode
        if (headingNode.children?.[0]?.value) {
          const content = headingNode.children[0].value;
          const isKeySection = [
            'EXECUTIVE SUMMARY',
            'PEER BENCHMARKING RESULTS', 
            'PRIORITIZED STRATEGIES'
          ].some(s => content.toUpperCase().includes(s));
          
          sections.push({
            type: isKeySection ? 'section' : 'heading',
            content: content,
            level: headingNode.depth
          })
        } else {
          console.warn('Invalid heading node structure:', headingNode)
          sections.push({
            type: 'heading',
            content: 'Untitled Section',
            level: headingNode.depth || 1
          })
        }
        break
      }
      case 'paragraph': {
        const paragraphNode = node as ParagraphNode
        sections.push({
          type: 'paragraph',
          content: paragraphNode.children.map(c => c.value).join(' ')
        })
        break
      }
      case 'table': {
        const tableNode = node as TableNode
        try {
          // Get the original markdown source lines for this table
          const position = tableNode.position
          if (position) {
            const startLine = position.start.line
            const endLine = position.end.line
            const tableLines = markdown.split('\n').slice(startLine - 1, endLine)
            const rawTable = tableLines.join('\n').trim()
            
            if (rawTable.includes('|')) {
              sections.push({
                type: 'table',
                content: rawTable,
                raw: true
              })
              break
            }
          }

          // Fallback to structured table parsing if raw extraction fails
          const headers: string[] = []
          const rows: string[][] = []
          
          tableNode.children.forEach((row, rowIndex) => {
            const rowData: string[] = []
            row.children.forEach(cell => {
              const value = cell.children[0]?.value || '-'
              rowData.push(value.trim())
              
              if (rowIndex === 0) {
                headers.push(value.trim())
              }
            })
            
            if (rowIndex > 0) {
              rows.push(rowData)
            }
          })

          // Convert to markdown table format
          const headerRow = `| ${headers.join(' | ')} |`
          const dividerRow = `| ${headers.map(() => '---').join(' | ')} |`
          const bodyRows = rows.map(row => `| ${row.join(' | ')} |`).join('\n')
          
          sections.push({
            type: 'table',
            content: `${headerRow}\n${dividerRow}\n${bodyRows}`,
            raw: true
          })
        } catch (error) {
          console.error('Failed to process table:', error)
          sections.push({
            type: 'paragraph',
            content: '[Table content could not be processed]'
          })
        }
        break
      }
      case 'list': {
        const listNode = node as ListNode
        const items = listNode.children
          .map(item => item.children[0]?.children[0]?.value)
          .filter(item => item && item !== 'undefined')
          .map(item => item!.trim());

        if (items.length > 0) {
          sections.push({
            type: 'list',
            content: 'List',
            items
          });
        }
        break;
      }
    }
  }

  // Walk the AST
  const walk = (node: HeadingNode | ParagraphNode | TableNode | ListNode | RootNode) => {
    processNode(node)
    if ('children' in node && node.children) {
      node.children.forEach(child => walk(child as HeadingNode | ParagraphNode | TableNode | ListNode))
    }
  }

  walk(tree as RootNode)
  return sections
}
