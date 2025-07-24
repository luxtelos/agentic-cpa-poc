import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { processJsonToPdfSections } from './pdfGenerationService';
import type { PdfSection } from './pdfTypes';
import { cleanTaxReport } from './pdfCleaner';
import { validatePdfStructure } from './pdfValidator';
import { TaxReportDocument } from '../components/PdfDocuments/TaxReportDocument';
import { ErrorDocument } from '../components/PdfDocuments/ErrorDocument';

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
  let systemPrompt = `In your response, extract everything after <think> tags, output a clean. 
          Tax Expert Instructions:
          ${customPrompt}

      FORMATTING REQUIREMENTS FOR REACT-PDF PARSING:  
        - Keep enough single line spaces between the end of each header section's content and the start of next header section.
        - Every sentence must be complete and properly punctuated
        - No truncation or incomplete sections
  
      CRITICAL OUTPUT REQUIREMENTS:
        - You are generating a report that will be parsed by React-PDF components and rendered as a professional PDF.
        - The final output must be a complete, structured text document that React-PDF components can parse into a professional tax advisory report with proper styling, tables, and visual hierarchy suitable for C-suite presentation.`;
  
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
        content: systemPrompt
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

export async function generateTaxPdf(jsonContent: string): Promise<Uint8Array> {
  try {
    console.debug('[PDF] Initializing document generation');
    const jsonData = JSON.parse(jsonContent);
    
    // Process JSON content
    console.debug('[PDF] Processing JSON content');
    let sections: PdfSection[] = processJsonToPdfSections(jsonData);
    try {
      if (!sections || sections.length === 0) {
        throw new Error('No valid content sections found');
      }
    } catch (error) {
      console.error('Failed to process JSON:', error);
      sections = [{
        type: 'text',
        content: 'Failed to generate report. Please try again.'
      }];
    }
    console.debug(`[PDF] Processed ${sections.length} sections`);
    
    if (!sections || !Array.isArray(sections)) {
      throw new Error('Invalid sections data from markdown processor');
    }

    const pdfDoc = pdf(React.createElement(TaxReportDocument, { sections }));
    const pdfBlob = await pdfDoc.toBlob();
    const pdfBytes = new Uint8Array(await pdfBlob.arrayBuffer());
    
    // Validate generated PDF bytes
    const validation = validatePdfStructure(pdfBytes);
    if (!validation.isValid) {
      throw new Error(`PDF validation failed: ${validation.errors.join(', ')}`);
    }
    
    console.debug('[PDF] Document generated and validated successfully');
    return pdfBytes;
  } catch (error) {
    console.error('[PDF] Generation failed:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    const errorPdfBlob = await pdf(React.createElement(ErrorDocument, { error })).toBlob();
    return new Uint8Array(await errorPdfBlob.arrayBuffer());
  }
}
