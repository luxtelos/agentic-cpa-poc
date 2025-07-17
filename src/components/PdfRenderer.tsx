import { useState, useEffect, useRef } from 'react';
import { supportsGPUAcceleration, measurePdfRenderPerformance } from '../lib/deviceCapabilities';
import { generateCpuPdf } from '../lib/pdfGeneration/cpuFallback';
import { generateTaxPdf } from '../lib/perplexityApi';
import { processMarkdownToPdfSections } from '../lib/markdownProcessor';

interface PdfRendererProps {
  content: string;
  fileName?: string;
  onRenderComplete?: (time: number) => void;
}

export function PdfRenderer({ 
  content, 
  fileName = 'report.pdf',
  onRenderComplete 
}: PdfRendererProps) {
  const [renderMode, setRenderMode] = useState<'gpu' | 'cpu'>('gpu');
  const [isGenerating, setIsGenerating] = useState(false);
  const performanceMetrics = useRef(measurePdfRenderPerformance());

  useEffect(() => {
    // Check device capabilities on mount
    if (!supportsGPUAcceleration()) {
      setRenderMode('cpu');
    }
  }, []);

  const generatePdf = async () => {
    setIsGenerating(true);
    const startTime = performance.now();

    try {
      let pdfBytes: Uint8Array;
      
      if (renderMode === 'gpu') {
        // Process content through markdown processor first
        const processedSections = await processMarkdownToPdfSections(content);
        const wrappedContent = processedSections.map(section => {
          switch(section.type) {
            case 'heading': return `# ${section.content}`;
            case 'paragraph': return section.content;
            case 'table': 
              return section.rows?.map(row => row.join(' | ')).join('\n');
            case 'list':
              return section.items?.map(item => `- ${item}`).join('\n');
            default: return section.content;
          }
        }).join('\n\n');
        
        pdfBytes = await generateTaxPdf(wrappedContent);
      } else {
        // Process content through markdown processor for CPU fallback too
        const processedSections = await processMarkdownToPdfSections(content);
        const wrappedContent = processedSections.map(section => {
          switch(section.type) {
            case 'heading': return `# ${section.content}`;
            case 'paragraph': return section.content;
            case 'table': 
              return section.rows?.map(row => row.join(' | ')).join('\n');
            case 'list':
              return section.items?.map(item => `- ${item}`).join('\n');
            default: return section.content;
          }
        }).join('\n\n');
        pdfBytes = await generateCpuPdf(wrappedContent);
      }

      const renderTime = performance.now() - startTime;
      performanceMetrics.current.recordSample(renderTime);
      onRenderComplete?.(renderTime);

      // Trigger download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    } catch (error) {
      console.error('PDF generation failed:', error);
      // Fallback to CPU if GPU fails
      if (renderMode === 'gpu') {
        setRenderMode('cpu');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-switch to CPU if performance degrades
  useEffect(() => {
    if (performanceMetrics.current.shouldFallbackToCpu() && renderMode === 'gpu') {
      setRenderMode('cpu');
    }
  }, [performanceMetrics.current.lastRenderTime]);

  return (
    <div className={`pdf-renderer ${renderMode}-mode`}>
      <button 
        onClick={generatePdf}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Download PDF'}
      </button>
      <div className="render-info">
        Mode: {renderMode.toUpperCase()}
        {performanceMetrics.current.lastRenderTime > 0 && (
          <span> (Last render: {performanceMetrics.current.lastRenderTime.toFixed(2)}ms)</span>
        )}
      </div>
    </div>
  );
}
