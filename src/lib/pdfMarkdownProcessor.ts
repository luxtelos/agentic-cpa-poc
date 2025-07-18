import { PDF_FONTS } from './fonts';

export const processMarkdownForPdf = (markdown: string, options?: {
  header?: string;
  footer?: string;
}): string => {
  // Add PDF-specific preprocessing
  let processed = markdown;
  
  // 1. Handle page breaks
  processed = processed.replace(/<!-- pagebreak -->/g, '\n<div style="page-break-after: always;"></div>\n');
  
  // 2. Add PDF header/footer
  const header = options?.header || '';
  const footer = options?.footer || '';
  processed = `
    <div class="pdf-header">${header}</div>
    ${processed}
    <div class="pdf-footer">${footer}</div>
  `;
  
  // 3. Transform tables for better PDF rendering
  processed = processed.replace(
    /\|(.+)\|\n\|([-: ]+)+\|/g, 
    (match, header, divider) => {
      const cols = header.split('|').filter(Boolean);
      const aligns = divider.split('|').filter(Boolean)
        .map(a => a.trim().startsWith(':') ? 
          (a.trim().endsWith(':') ? 'center' : 'left') : 
          (a.trim().endsWith(':') ? 'right' : 'left'));
      
      return `\n<table>\n<thead>\n<tr>\n${
        cols.map((col, i) => 
          `<th style="text-align: ${aligns[i]}">${col.trim()}</th>`
        ).join('\n')
      }\n</tr>\n</thead>\n<tbody>`;
    }
  );
  
  // Close table tags
  processed = processed.replace(/\|\n([^|])/g, '</tbody>\n</table>\n$1');
  
  return processed;
};

export const getPdfStyles = () => `
  <style>
    body {
      font-family: ${PDF_FONTS.primary.name}, ${PDF_FONTS.fallbacks.join(', ')};
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    .pdf-header, .pdf-footer {
      position: fixed;
      width: 100%;
      text-align: center;
      font-size: 10px;
      color: #666;
    }
    .pdf-header {
      top: 0;
    }
    .pdf-footer {
      bottom: 0;
    }
    .pdf-content {
      margin-top: 20px;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
    }
    @page {
      margin: 1.5cm;
    }
  </style>
`;
