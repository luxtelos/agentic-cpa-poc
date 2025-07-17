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

interface PdfSection {
  type: 'heading' | 'paragraph' | 'table' | 'list'
  content: string
  level?: number
  rows?: string[][]
  items?: string[]
}

export async function processMarkdownToPdfSections(rawContent: string): Promise<PdfSection[]> {
  // Extract content after </think> tag if present
  const content = rawContent.includes('</think>') 
    ? rawContent.split('</think>')[1].trim()
    : rawContent;

  // Convert custom syntax to markdown
  const markdown = content
    .replace(/SECTION_HEADER:\s*(.*?)\n/g, '## $1\n')
    .replace(/CONTENT_BLOCK:\s*(.*?)\n/g, '$1\n\n')
    .replace(/STRATEGY_BLOCK:\s*(.*?)\n/g, '### $1\n')
    .replace(/METRIC:\s*(.*?)\n/g, '**$1**\n\n')
    .replace(/STEPS_LIST:\n((\s*\d+\..*?\n)+)/g, (_, items) => 
      items.split('\n').filter(Boolean).map(item => `- ${item.replace(/^\s*\d+\.\s*/, '')}`).join('\n') + '\n\n'
    )
    .replace(/TABLE_START\n([\s\S]*?)\nTABLE_END/g, (_, table) => {
      const rows = table.split('\n').filter(Boolean);
      const header = `| ${rows[0].split('|').join(' | ')} |\n|${rows[0].split('|').map(() => '---').join('|')}|`;
      const body = rows.slice(1).map(row => `| ${row.split('|').join(' | ')} |`).join('\n');
      return `${header}\n${body}\n\n`;
    });

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)

  const tree = await processor.parse(markdown)
  const sections: PdfSection[] = []

  // Process AST nodes
  const processNode = (node: Node) => {
    switch (node.type) {
      case 'heading': {
        const headingNode = node as HeadingNode
        sections.push({
          type: 'heading',
          content: headingNode.children[0].value,
          level: headingNode.depth
        })
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
        const rows = tableNode.children.map(row => 
          row.children.map(cell => cell.children[0].value)
        )
        sections.push({
          type: 'table',
          content: 'Table',
          rows
        })
        break
      }
      case 'list': {
        const listNode = node as ListNode
        sections.push({
          type: 'list',
          content: 'List',
          items: listNode.children.map(item => item.children[0].children[0].value)
        })
        break
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
