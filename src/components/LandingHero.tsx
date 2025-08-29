import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Calculator, Loader2 } from 'lucide-react';
import { PdfHandler } from '@/components/PdfHandler';
import { MultiFileUpload } from '@/components/MultiFileUpload';
import { useAppContext } from '@/contexts/AppContext';
import * as pdfjsLib from 'pdfjs-dist';
import { useToast } from '@/components/ui/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  preparePerplexityApiPayload,
  getChatCompletion,
  extractReportContent
} from '@/lib/perplexityApi';
import { LLMServiceFactory, LLMProvider } from '@/services/llm/LLMServiceFactory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const LandingHero: React.FC = () => {
  const { uploadTaxFile } = useAppContext();
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const [pdfText, setPdfText] = useState('');
  const [fileCount, setFileCount] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [provider, setProvider] = useState<LLMProvider>('perplexity');
  const [useNewUpload, setUseNewUpload] = useState(false);

  const handleFileUpload = async (file: File) => {
    
    setIsUploading(true);
    try {
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
      toast({
        title: 'Error Processing PDF',
        description: 'Failed to extract text from PDF',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }

  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [reportContent, setReportContent] = useState('');
  
  // Check if Claude is available
  const availableProviders = LLMServiceFactory.getAvailableProviders();
  const hasClaudeSupport = availableProviders.includes('claude');

  const processWithLLM = async () => {
    if (selectedFiles.length === 0 && !pdfText) {
      toast({
        title: 'No Files Selected',
        description: 'Please upload at least one PDF file',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const service = LLMServiceFactory.getProvider(provider);
      
      // Use new service layer for processing
      const response = await service.processRequest({
        files: selectedFiles,
        prompt: pdfText ? undefined : 'Analyze these tax documents and provide optimization recommendations',
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setReportContent(response.content);
      
      toast({
        title: 'Report Generated',
        description: `AI recommendations ready via ${provider}`,
      });
    } catch (error) {
      console.error('LLM processing failed:', error);
      toast({
        title: 'Error Generating Report',
        description: error instanceof Error ? error.message : 'Failed to generate recommendations',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const sendToPerplexity = async () => {
    if (!pdfText) {
      toast({
        title: 'No Text Found',
        description: 'Please upload and process a PDF first',
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
      
      toast({
        title: 'Report Generated',
        description: 'AI recommendations ready',
      });
    } catch (error) {
      console.error('Async job failed:', error);
      toast({
        title: 'Error Generating Report',
        description: error instanceof Error ? error.message : 'Failed to generate recommendations',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-200">
      <ThemeToggle />
      {/* Professional gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/40 via-white to-primary-50/40 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
      </div>

      {/* Hero Content */}

      <div className="mx-auto max-w-7xl py-16 sm:py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl animate-slide-in-from-top">
            Smart Corporate Tax Optimization
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 animate-fade-in">
            Upload your tax documents and get AI-powered recommendations to maximize deductions and minimize liabilities.
          </p>
          
          {/* Provider Selection & File Upload */}
          
          {hasClaudeSupport && (
            <div className="mt-6 flex justify-center">
              <Tabs value={provider} onValueChange={(v) => setProvider(v as LLMProvider)} className="w-auto">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="perplexity">Perplexity (Single File)</TabsTrigger>
                  <TabsTrigger value="claude">Claude (Multi-File)</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          <div className="mt-10 flex flex-col items-center gap-4">
            {/* Toggle between old and new upload UI */}
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseNewUpload(!useNewUpload)}
              >
                {useNewUpload ? 'Use Legacy Upload' : 'Try New Multi-File Upload'}
              </Button>
            </div>
            
            {useNewUpload ? (
              <div className="w-full max-w-2xl">
                <MultiFileUpload
                  provider={provider}
                  onFilesReady={setSelectedFiles}
                  isProcessing={isProcessing}
                />
                
                {selectedFiles.length > 0 && (
                  <Button
                    onClick={processWithLLM}
                    disabled={isProcessing}
                    className="mt-4 w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Calculator className="h-5 w-5 mr-2" />
                        Get Tax Recommendations
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                  type="file"
                  name="taxFile"
                  id="taxFile"
                  accept="application/pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const files = e.target.files;
                    if (files) {
                      setFileCount(files.length);
                      if (files.length > 0) {
                        handleFileUpload(files[0]);
                      }
                    }
                  }}
                />
                <label
                  htmlFor="taxFile"
                  className="inline-flex items-center gap-x-2 rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all duration-200"
                >
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                  {isUploading ? 'Processing...' : (fileCount > 0 ? `Uploaded (${fileCount}) files` : 'Upload PDF')}
                </label>
                </div>

                {pdfText && (
                <button
                  onClick={sendToPerplexity}
                  disabled={isProcessing}
                  className={`inline-flex items-center gap-x-2 rounded-md px-3.5 py-2.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all duration-200
                    ${isProcessing ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-success-600 hover:bg-success-500 text-white hover:shadow-md'}`}
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
            )}
            
            {!useNewUpload && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Max file size: 5MB</p>
            )}
          </div>

          {/* PDF Report */}
          {reportContent && (
            <div className="mt-8 w-full max-w-3xl mx-auto mb-16 animate-slide-in-from-bottom">
              <PdfHandler 
                content={reportContent}
                defaultAction="view"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LandingHero;
