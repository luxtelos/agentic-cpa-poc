import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

export const parseMarkdown = (content: string) => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm); // For GitHub Flavored Markdown (tables, etc.)

  return processor.parse(content);
};

export const processMarkdown = async (content: string) => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm);

  const ast = await processor.run(processor.parse(content));
  return ast;
};

// Type definitions for AST nodes (simplified)
export interface MarkdownNode {
  type: string;
  children?: MarkdownNode[];
  value?: string;
  depth?: number;
  // Add other node properties as needed
}

export const isNodeType = (node: unknown, type: string): node is MarkdownNode => {
  return typeof node === 'object' && 
         node !== null && 
         'type' in node && 
         node.type === type;
};
