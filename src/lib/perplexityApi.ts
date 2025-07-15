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
    model: "sonar-pro",
    messages: [
      { 
        role: "system", 
        content: `Tax Expert Instructions:\n${systemPrompt}\n
        In your response, extract everything after <think> tags, output a clean, 
        ready-to-render tax recommendation report suitable for a PDF.
        FORMATTING REQUIREMENTS:
        - Use plain text only (no markdown symbols)
        - Capitalize section headers
        - Use single line breaks between items
        - Separate sections with double line breaks
        - Avoid special characters
        - Keep bullet points as plain text lines`
      },
      { role: "user", content: content }
    ],
    search_mode: "web",
    reasoning_effort: "medium",
    max_tokens: 2048,
    temperature: 0.2,
    top_p: 0.9,
    stream: false,
    return_related_questions: false,
    search_recency_filter: "month"
  };
}

export function extractReportContent(rawResponse: string) {
  const report = rawResponse.split('</think>')[1]?.trim() ?? rawResponse;
  return report;
}

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateTaxPdf(content: string): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.create();
    
    // First remove any HTML tags from content
    const cleanContent = content.replace(/<[^>]*>?/gm, '');
    
    // Create a single page
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    
    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Draw document title
    page.drawText('TAX OPTIMIZATION REPORT', {
      x: 50,
      y: 800,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0.5),
    });

    // Draw divider line
    page.drawLine({
      start: { x: 50, y: 790 },
      end: { x: 545, y: 790 },
      thickness: 1,
      color: rgb(0, 0, 0.5),
    });

    // Add content
    const lines = cleanContent.split('\n');
    let yPosition = 750;
    for (const line of lines) {
      if (line.trim()) {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 12,
          font,
          color: rgb(0, 0, 0),
        });
        yPosition -= 20;
      }
    }

    // Add footer
    const footerText = `Generated on ${new Date().toLocaleDateString()}`;
    page.drawText(footerText, {
      x: 50,
      y: 30,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Finalize and return PDF bytes
    const pdfBytes = await pdfDoc.save();
    const uint8Array = new Uint8Array(pdfBytes);
    
    if (uint8Array.length === 0) {
      throw new Error('Generated empty PDF');
    }
    
    return uint8Array;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
}
