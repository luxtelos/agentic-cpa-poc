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
    model: model || "sonar-pro",
    messages: [
      { 
        role: "system", 
        content: `In your response, extract everything after <think> tags, output a clean, 
        ready-to-render tax recommendation report suitable for a PDF.
          Tax Expert Instructions:
          ${systemPrompt}

      CRITICAL OUTPUT REQUIREMENTS:
      You are generating a comprehensive tax optimization strategy report that will be parsed by React-PDF components and rendered as a professional PDF. 
      The raw text output must be structured for automatic parsing and styling.

      CONTENT REQUIREMENTS:
      1. COMPLETENESS: Provide full, detailed analysis with no truncated sentences - minimum 3000 words
      2. DEPTH: Include comprehensive implementation steps, timelines, risk assessments, and financial projections
      3. STRUCTURE: Follow professional CPA advisory firm report format with clear hierarchical sections
      4. ACTIONABILITY: Provide specific, measurable recommendations with exact deadlines and dollar amounts

      FORMATTING REQUIREMENTS FOR REACT-PDF PARSING:
      - Output clean, structured text with semantic markers that React components can parse
      - Use CONSISTENT section markers that JavaScript can easily identify
      - NO raw markdown symbols (no * ** # ## ### _ \` [ ] etc.)
      - NO HTML tags or angle brackets
      - Use clear, parseable delimiters for different content types
      - Structure tables using consistent column separators
      - Use standardized formatting for financial data and metrics

      QUALITY STANDARDS:
      - Every sentence must be complete and properly punctuated
      - Use specific dollar amounts and percentages throughout
      - Include exact implementation dates and deadlines
      - Professional business language appropriate for C-suite executives
      - Consistent formatting using the specified semantic markers
      - No truncation or incomplete sections

      PARSING INSTRUCTIONS:
      - Use SECTION_HEADER: for main sections that need large headers
      - Use CONTENT_BLOCK: for paragraph content under sections
      - Use STRATEGY_BLOCK: for individual strategy names
      - Use METRIC: for financial and timeline data
      - Use STEPS_LIST: for numbered implementation steps
      - Use TABLE_START/TABLE_END with TABLE_HEADER and TABLE_ROW for structured data
      - Use FINANCIAL_METRIC: for summary financial data
      - Use RISK_ITEM: and MITIGATION: for risk assessment content
      - Use ACTION_ITEM: for next steps and immediate actions

    The final output must be a complete, structured text document that React-PDF components can parse into a professional tax advisory report with proper styling, tables, and visual hierarchy suitable for C-suite presentation.`
      },
      { role: "user", content: content }
    ],
    search_mode: "web",
    reasoning_effort: "medium",
    // max_tokens: 1024,
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
import { measureText, calculateVerticalSpacing } from './pdfLayoutUtils';

import { processMarkdownToPdfSections } from './markdownProcessor';

export async function generateTaxPdf(content: string): Promise<Uint8Array> {
  try {
    console.debug('[PDF] Initializing document generation');
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);
    
    // Process markdown into structured sections
    console.debug('[PDF] Processing markdown content');
    const sections = await processMarkdownToPdfSections(content);
    console.debug(`[PDF] Processed ${sections.length} sections`);
    
    // Validate sections
    if (!sections || !Array.isArray(sections)) {
      throw new Error('Invalid sections data from markdown processor');
    }

    // Create pages with professional styling
    let page = pdfDoc.addPage([595.28, 841.89]);
    let yPosition = 780;
    const currentPage = 1; // Tracked for future pagination features
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
          yPosition -= calculateVerticalSpacing(10, headingDimensions.height, 'heading');
          break;
        }

        case 'paragraph': {
          if (!section.content) {
            console.warn('[PDF] Empty paragraph content, skipping');
            break;
          }
          const paragraphDimensions = measureText(
            page,
            section.content,
            font,
            12,
            500
          );
          console.debug(`[PDF] Drawing paragraph: ${section.content.substring(0, 30)}...`);
          page.drawText(section.content, {
            x: 60,
            y: yPosition,
            size: 12,
            font,
            color: rgb(0, 0, 0),
            maxWidth: 500,
          });
            yPosition -= calculateVerticalSpacing(5, paragraphDimensions.height, 'paragraph');
          break;
        }

        case 'table':
          if (!section.rows || !Array.isArray(section.rows)) {
            console.warn('[PDF] Invalid table data, skipping');
            break;
          }
          console.debug(`[PDF] Drawing table with ${section.rows.length} rows`);
          if (section.rows) {
            // Draw table header
            const header = section.rows[0];
            header.forEach((cell, i) => {
              page.drawText(cell, {
                x: 50 + i * 120,
                y: yPosition,
                size: 12,
                font: boldFont,
                color: rgb(0, 0, 0.5),
              });
            });
            yPosition -= 20;

            // Draw table rows
            for (const row of section.rows.slice(1)) {
              row.forEach((cell, i) => {
                page.drawText(cell, {
                  x: 50 + i * 120,
                  y: yPosition,
                  size: 11,
                  font,
                  color: rgb(0, 0, 0),
                });
              });
              yPosition -= 15;
            }
            yPosition -= 15; // Extra spacing after table
          }
          break;

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
              yPosition -= 20;
            });
          }
          break;
      }

      // Check if we need a new page before adding content
      const requiredSpace = calculateVerticalSpacing(10, section.type === 'table' ? 100 : 50, section.type);
      if (yPosition - requiredSpace < 50) { // Leave 50px margin at bottom
        page = pdfDoc.addPage([595.28, 841.89]);
        yPosition = 780; // Reset to top of new page
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
    throw error; // Let the renderer handle fallback
  }
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
