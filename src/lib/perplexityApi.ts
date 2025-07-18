export async function getChatCompletion(content: string) {
  console.log('[DEBUG] API - Preparing sync request payload');
  const payload = await preparePerplexityApiPayload(content);
  console.log('[DEBUG] API - Sending request', {
    contentLength: content.length,
    model: payload.model,
    timestamp: new Date().toISOString()
  });

  const proxiedUrl = `${import.meta.env.VITE_PROXY_BASE}${import.meta.env.VITE_PROXY_URL_FORMAT}`;
  const response = await fetch(proxiedUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_PERPLEXITY_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  console.log('[DEBUG] API - Response data:', data);
  
  if (!data?.choices?.[0]?.message?.content) {
    throw new Error('Invalid API response - missing content');
  }
  
  return data;
}

export async function preparePerplexityApiPayload(content: string) {
  const model = import.meta.env.VITE_PERPLEXITY_MODEL || 'sonar-reasoning-pro';
  console.log('[DEBUG] API - Loading system prompt');
  const customPrompt = localStorage.getItem('customPrompt');
  let systemPrompt = customPrompt;
  
  if (!systemPrompt) {
    const promptResponse = await fetch('/prompt.txt');
    systemPrompt = await promptResponse.text();
    console.log('[DEBUG] API - Using default prompt from file');
  } else {
    console.log('[DEBUG] API - Using custom prompt from localStorage');
  }

  console.log('[DEBUG] API - System prompt loaded', {
    length: systemPrompt.length,
    timestamp: new Date().toISOString()
  });

  return {
    model: model,
    messages: [
      { 
        role: "system", 
        content: `In your response, extract everything after <think> tags, output a clean, 
        ready-to-render tax recommendation report suitable for a PDF.
          Tax Expert Instructions:
          ${systemPrompt}

      FORMATTING REQUIREMENTS FOR REACT-PDF PARSING:
      - Use standardized formatting for financial data and metrics
      - Keep enough single line spaces between the end of each header section's content and the start of next header section.
      - Every sentence must be complete and properly punctuated
      - Use specific dollar amounts and percentages throughout
      - No truncation or incomplete sections

  
      CRITICAL OUTPUT REQUIREMENTS:
      You are generating a report that will be parsed by React-PDF components and rendered as a professional PDF.
      Produce _only_ the Markdown content (no JSON, no extra commentary). Follow these rules:
          1. **Structure**
            - Use #…###### for headings.
            - Write paragraphs as plain text separated by blank lines.
            - Create bullet lists with \\\`- \\\` or numbered lists with \\\`1. \\\`.
            - Format tables using standard Markdown pipe syntax with consistent spacing.
            - Keep one row per line, no line breaks within cells
            - Tables must have:
              - Clear headers in first row. No empty header cells
              - Consistent column alignment
              - No duplicate rows
              - Numeric values right-aligned
              - Text values left-aligned

          2. **Key-Value Formatting Rules:**
            - Always include both key name AND value when using colons e.g. "Taxable Income: $718,789"
            - Never use standalone colons e.g. ": $718,789" is invalid
            - For definition lists, use: Key Term => Definition text
            - Validate uniqueness of:
              - Table rows
              - Key-value pairs
              - Section headers

          2. **Styling**
            - Use **bold**, _italic_, \\\`inline code\\\`, and [links](https://example.com) freely.
            - Avoid any wrapper objects or metadata—output pure Markdown.

          3. **Data Formatting**
            - Dates as \\\`YYYY-MM-DD\\\`
            - Currency as \\\`$XX,XXX\\\`
            - Percentages as \\\`XX%\\\`
            - Empty cells as \\\`-\\\`

          4. **Compatibility**
            - Ensure all elements are supported by **react-markdown** (with \\\`remark-gfm\\\`) and map cleanly to PDF components in **@react-pdf/renderer** or **react-to-pdf**.

    The final output must be a complete, structured text document that React-PDF components can parse into a professional tax advisory report with proper styling, tables, and visual hierarchy suitable for C-suite presentation.`
      },
      { role: "user", content: content }
    ],
    search_mode: "web",
    reasoning_effort: "medium",
    temperature: 0.1,
    top_p: 0.9,
    top_k: 0,
    stream: false,
    return_related_questions: false,
    return_images: false,
    presence_penalty: 0,
    frequency_penalty: 0,
    web_search_options: {
      'search_context_size': 'low'
    },
    search_recency_filter: "month"
  };
}

export function extractReportContent(rawResponse: string) {
  const report = rawResponse.split('</think>')[1]?.trim() ?? rawResponse;
  return report;
}

import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';
import { measureText, wrapText, calculateVerticalSpacing } from './pdfTextUtils';

import { processMarkdownToPdfSections } from './markdownProcessor';
import type { PdfSection, PdfSectionType } from './markdownProcessor';
import { cleanTaxReport, validatePdfContent } from './pdfCleaner';

export async function generateTaxPdf(content: string): Promise<Uint8Array> {
  try {
    console.debug('[PDF] Initializing document generation');
    const cleanedContent = validatePdfContent(content);
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);
    
  // Process and validate markdown content
  console.debug('[PDF] Processing markdown content');
  let sections: PdfSection[];
  try {
    sections = await processMarkdownToPdfSections(cleanedContent);
    // Additional validation
    if (!sections || sections.length === 0) {
      throw new Error('No valid content sections found');
    }
  } catch (error) {
    console.error('Failed to process markdown:', error);
    // Fallback content
    sections = [{
      type: 'paragraph',
      content: 'Failed to generate report. Please try again.'
    }];
  }
    console.debug(`[PDF] Processed ${sections.length} sections`);
    
    // Validate sections
    if (!sections || !Array.isArray(sections)) {
      throw new Error('Invalid sections data from markdown processor');
    }

    // Create pages with consistent width and margins
    const pageWidth = 842; // A4 width in points (1 point = 1/72 inch)
    const pageHeight = 595.28;
    const margin = 50;
    
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - margin;
    const currentPage = 1;
    
    // Set consistent content width
    const contentWidth = pageWidth - (margin * 2);
    console.debug(`[PDF] Created initial page ${currentPage}`);

    // Report title
    page.drawText('TAX OPTIMIZATION REPORT', {
      x: 50,
      y: yPosition,
      size: 24,
      font: titleFont,
      color: rgb(0.2, 0.4, 0.6),
    });
    yPosition -= 60;

    // Process each section
    for (const section of sections) {
      switch (section.type) {
        case 'heading': {
          if (!section.content) {
            console.warn('[PDF] Empty heading content, using fallback');
            section.content = 'Untitled Section';
          }
          const fontSize = 16 - (section.level || 1) * 2;
          const headingDimensions = measureText(
            page,
            section.content,
            boldFont,
            fontSize,
            500
          );
          console.debug(`[PDF] Drawing heading: ${section.content.substring(0, 30)}...`);
          page.drawText(section.content, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font: boldFont,
            color: rgb(0, 0, 0.5),
          });
          yPosition -= calculateVerticalSpacing(10, headingDimensions.height, 'heading' as PdfSectionType);
          break;
        }

        case 'paragraph': {
          const content = section.content || '[Content not available]';
          const fontSize = 12;
          const lineHeight = fontSize * 1.2;
          const lines = wrapText(content, font, fontSize, 500);

          console.debug(`[PDF] Drawing paragraph: ${content.substring(0, 30)}...`);

          // Draw each wrapped line
          lines.forEach((line) => {
            page.drawText(line, {
              x: 60,
              y: yPosition,
              size: fontSize,
              font,
              color: rgb(0, 0, 0),
            });
            yPosition -= lineHeight;
          });

          const paragraphHeight = lines.length * lineHeight;
          yPosition -= calculateVerticalSpacing(5, paragraphHeight, 'paragraph' as PdfSectionType) - paragraphHeight;
          break;
        }

        case 'table': {
          // Handle raw markdown tables
          const tableContent = section.content || '';
          const rows = tableContent.split('\n').filter(line => line.trim());
          
          if (rows.length < 2) {
            console.warn('[PDF] Invalid table format, using fallback');
            rows.push('| Column 1 | Column 2 |');
            rows.push('|----------|----------|');
            rows.push('| No data  | available|');
          }

          console.debug(`[PDF] Drawing table with ${rows.length} rows`);
          
          // Calculate dynamic column widths
          const firstRow = rows[0];
          const columnCount = (firstRow.match(/\|/g) || []).length - 1;
          
          // Measure all cell content to determine max widths
          // Calculate column widths based on longest content in each column
          const colWidths = Array(columnCount).fill(0);
          rows.forEach(row => {
            const cells = row.split('|').slice(1, -1);
            cells.forEach((cell, i) => {
              const text = cell.trim();
              const textWidth = measureText(page, text, font, 11, 1000).width;
              colWidths[i] = Math.max(colWidths[i], textWidth + 20); // No max width limit
            });
          });
          
          // Ensure minimum column width for empty cells
          colWidths.forEach((w, i) => {
            if (w < 100) colWidths[i] = 100;
          });
          
          // Distribute remaining space proportionally
          const totalWidth = colWidths.reduce((sum, w) => sum + w, 0);
          const remainingSpace = Math.max(0, 500 - totalWidth);
          if (remainingSpace > 0) {
            const scale = remainingSpace / totalWidth;
            colWidths.forEach((w, i) => colWidths[i] = w * (1 + scale));
          }
          
          // Draw each row with wrapped text
          let tableHeight = 0;
          rows.forEach((row, rowIndex) => {
            const isHeader = rowIndex === 0 || row.includes('---');
            const cells = row.split('|').slice(1, -1);

            const fontSize = isHeader ? 12 : 11;
            const lineHeight = fontSize * 1.2;
            let rowHeight = 0;

            cells.forEach((cell, colIndex) => {
              const text = cell.trim();
              const lines = wrapText(text, isHeader ? boldFont : font, fontSize, colWidths[colIndex]);

              lines.forEach((line, lineIndex) => {
                const x = 50 + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
                const y = yPosition - tableHeight - lineIndex * lineHeight;
                page.drawText(line, {
                  x,
                  y,
                  size: fontSize,
                  font: isHeader ? boldFont : font,
                  color: isHeader ? rgb(0, 0, 0.5) : rgb(0, 0, 0)
                });
              });

              rowHeight = Math.max(rowHeight, lines.length * lineHeight);
            });

            tableHeight += rowHeight;
          });

          yPosition -= tableHeight;
          yPosition -= calculateVerticalSpacing(5, tableHeight, 'table') - tableHeight;
          break;
        }

        case 'list':
          if (section.items) {
            section.items.forEach((item, i) => {
              page.drawText(`• ${item}`, {
                x: 60,
                y: yPosition,
                size: 12,
                font,
                color: rgb(0, 0, 0),
                maxWidth: 500,
              });
              yPosition -= calculateVerticalSpacing(5, 12, 'paragraph');
            });
          }
          break;
      }

      // Check if we need a new page before adding content
      const requiredSpace = calculateVerticalSpacing(
        10, 
        section.type === 'table' ? 100 : 50,
        (section.type === 'list' ? 'paragraph' : section.type) as PdfSectionType
      );
      if (yPosition - requiredSpace < margin) { // Leave margin at bottom
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin; // Reset to top of new page
        console.debug('[PDF] Added new page at section:', section.type);
      }
    }

    // Footer
    page.drawText('Confidential - Tax Advisory Report', {
      x: 50,
      y: 30,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    console.debug('[PDF] Document generated successfully');
    return new Uint8Array(pdfBytes);
  } catch (error) {
    console.error('[PDF] Generation failed:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Create a minimal error PDF
    const errorPdf = await PDFDocument.create();
    const page = errorPdf.addPage([595.28, 841.89]);
    const font = await errorPdf.embedFont(StandardFonts.Helvetica);
    
    page.drawText('Error Generating Report', {
      x: 50,
      y: 700,
      size: 24,
      font,
      color: rgb(1, 0, 0),
    });
    
    page.drawText(error.message.substring(0, 100), {
      x: 50,
      y: 650,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('Please try again or contact support', {
      x: 50,
      y: 600,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    const errorPdfBytes = await errorPdf.save();
    return new Uint8Array(errorPdfBytes);
  }
}
