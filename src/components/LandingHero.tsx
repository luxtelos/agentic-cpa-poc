import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Calculator, Loader2 } from 'lucide-react';
import { PdfViewer } from './PdfViewer';
import { useAppContext } from '@/contexts/AppContext';
import * as pdfjsLib from 'pdfjs-dist';
import { useToast } from '@/components/ui/use-toast';
import { 
  preparePerplexityApiPayload,
  getChatCompletion,
  extractReportContent,
  generateTaxPdf
} from '@/lib/perplexityApi';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const LandingHero: React.FC = () => {
  const { uploadTaxFile } = useAppContext();
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const [pdfText, setPdfText] = useState('');

  const validatePdf = async (file: File) => {
    if (file.size < 1024) throw new Error('PDF too small');
    const slice = await file.slice(0, 4).text();
    if (slice !== '%PDF') throw new Error('Invalid PDF format');
    return true;
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Validate before processing
      await validatePdf(file);
      
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a PDF file',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'File size must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }

      
      console.log('[DEBUG] PDF Upload - File selected:', {
        name: file.name,
        type: file.type, 
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        timestamp: new Date().toISOString()
      });
      console.log('[DEBUG] Starting PDF text extraction...');
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ');
      }


      console.log('[DEBUG] PDF Extraction Complete', {
        pageCount: pdf.numPages,
        textLength: fullText.length,
        sample: fullText.substring(0, 100),
        timestamp: new Date().toISOString()
      });
      setPdfText(fullText);
      sessionStorage.setItem('extractedText', fullText);
      console.log('[DEBUG] Storage - Extracted text saved to sessionStorage:', {
        length: sessionStorage.getItem('extractedText')?.length,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: 'File Processed',
        description: 'Text extracted successfully',
      });
      
      // Prepare Perplexity API payload
      const apiPayload = await preparePerplexityApiPayload(fullText);
      console.log('Prepared Perplexity API Payload:', apiPayload);
    } catch (error) {
      console.error('[PDF] Processing Error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      toast({
        title: 'Error Processing PDF',
        description: 'Failed to extract text from PDF',
        variant: 'destructive',
      });
      throw error; // Re-throw to trigger ErrorDocument
    } finally {
      setIsUploading(false);
    }

  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const sendToPerplexity = async () => {
    if (!pdfText) {
      toast({
        title: 'No Text Found',
        description: 'Please upload and process a PDF first',
        variant: 'destructive',
      });
      return;
    }

    // Verify PDF worker is loaded
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      toast({
        title: 'PDF Worker Error',
        description: 'PDF rendering worker not loaded',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('[DEBUG] API - Sending sync request with text length:', pdfText.length);
      const response = await getChatCompletion(pdfText);
      console.log('[DEBUG] API - Request completed:', {
        timestamp: new Date().toISOString(),
        contentLength: response.choices[0].message.content.length
      });
      
      const rawContent = response.choices[0].message.content;
      const report = extractReportContent(rawContent);
      
      setReportContent(report);
      const pdfBytes = await generateTaxPdf(report);
      setPdfData(pdfBytes);
      // Create blob URL for viewing
      const blobUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
      setPdfUrl(blobUrl);
      // Cleanup on component unmount
      return () => {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
      };
      console.log('[DEBUG] Report - Generated content:', {
        rawLength: rawContent.length,
        reportLength: report.length,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: 'Report Generated',
        description: 'AI recommendations ready',
      });
    } catch (error) {
      console.error('[API] Processing Error:', {
        message: error instanceof Error ? error.message : 'Unknown API error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        inputLength: pdfText?.length
      });
      toast({
        title: 'Error Generating Report',
        description: error instanceof Error ? error.message : 'Failed to generate recommendations',
        variant: 'destructive',
      });
      throw error; // Re-throw to trigger ErrorDocument
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative flex-none overflow-y-auto px-6 lg:flex lg:z-40 lg:px-0 min-h-screen">
      {/* Animated Background */}

      <div className="absolute inset-0 -z-10 overflow-hidden bg-gray-950 lg:right-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-lg">
        <svg className="absolute -bottom-48 left-[-40%] h-320 w-[180%] lg:top-[-40%] lg:-right-40 lg:bottom-auto lg:left-auto lg:h-[180%] lg:w-7xl transition-transform duration-1000 ease-in-out" aria-hidden="true" style={{filter: 'blur(0.5px)'}}>
          <defs>
            <radialGradient id="gradient-desktop" cx="100%">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.3)" className="animate-pulse">
                <animate attributeName="stop-color" values="rgba(56, 189, 248, 0.3);rgba(99, 102, 241, 0.35);rgba(236, 72, 153, 0.3);rgba(56, 189, 248, 0.3)" dur="18s" repeatCount="indefinite" />
              </stop>
              <stop offset="53.95%" stopColor="rgba(0, 71, 255, 0.09)">
                <animate attributeName="stop-color" values="rgba(0, 71, 255, 0.09);rgba(139, 92, 246, 0.12);rgba(219, 39, 119, 0.09);rgba(0, 71, 255, 0.09)" dur="18s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="rgba(10, 14, 23, 0)" />
            </radialGradient>
            <radialGradient id="gradient-mobile" cy="100%">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.3)">
                <animate attributeName="stop-color" values="rgba(56, 189, 248, 0.3);rgba(99, 102, 241, 0.35);rgba(236, 72, 153, 0.3);rgba(56, 189, 248, 0.3)" dur="18s" repeatCount="indefinite" />
              </stop>
              <stop offset="53.95%" stopColor="rgba(0, 71, 255, 0.09)">
                <animate attributeName="stop-color" values="rgba(0, 71, 255, 0.09);rgba(139, 92, 246, 0.12);rgba(219, 39, 119, 0.09);rgba(0, 71, 255, 0.09)" dur="18s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="rgba(10, 14, 23, 0)" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Hero Content */}

      <div className="mx-auto max-w-7xl py-16 sm:py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Smart Corporate Tax Optimization
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Upload your tax documents and get AI-powered recommendations to maximize deductions and minimize liabilities.
          </p>
          
          {/* File Upload */}

          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="file"
                  name="taxFile"
                  id="taxFile"
                  accept="application/pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <label
                  htmlFor="taxFile"
                  className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                  {isUploading ? 'Processing...' : 'Upload PDF'}
                </label>
              </div>

              {pdfText && (
                <button
                  onClick={sendToPerplexity}
                  disabled={isProcessing}
                  className={`inline-flex items-center gap-x-2 rounded-md px-3.5 py-2.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                    ${isProcessing ? 'bg-gray-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-5 w-5" />
                      Get Tax Recommendations
                    </>
                  )}
                </button>
              )}
            </div>
            <p className="text-sm text-gray-400">Max file size: 5MB</p>
          </div>

          {/* PDF Report */}
          {pdfUrl && (
            <div className="mt-8 w-full max-w-3xl mx-auto mb-16">
              <PdfViewer 
                pdfUrl={pdfUrl}
                className="min-h-[600px] max-h-[80vh]"
              />
              <div className="mt-4 flex justify-center">
                <a
                  href={pdfUrl}
                  download="tax-report.pdf"
                  className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  Download PDF Report
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LandingHero;
