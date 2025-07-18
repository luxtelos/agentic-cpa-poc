import { PdfAstRenderer } from './PdfAstRenderer';
import { cleanMarkdown } from '@/lib/cleanMarkdown';

interface PdfRendererProps {
  markdown: string;
  header?: string;
  footer?: string;
}

export const PdfRenderer = ({ markdown, header, footer }: PdfRendererProps) => {
  const cleanedMarkdown = cleanMarkdown(markdown);
  return <PdfAstRenderer markdown={cleanedMarkdown} />;
};
