import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { extractTextFromPdf } from '@/lib/pdfUtils';
import { getChatCompletion, generateTaxPdf } from '@/lib/perplexityApi';
const DEFAULT_PROMPT = `Generate a comprehensive tax optimization report with:
1. Executive summary
2. Current tax position analysis
3. Recommended strategies
4. Implementation roadmap
5. Risk assessment`;

interface TaxData {
  id: string;
  fileName: string;
  uploadDate: Date;
  pdfReport: Uint8Array;
  pdfUrl: string;
  recommendations: string;
}

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  taxData: TaxData | null;
  uploadTaxFile: (file: File) => Promise<void>;
  showDashboard: boolean;
  setShowDashboard: (show: boolean) => void;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  taxData: null,
  uploadTaxFile: async () => {},
  showDashboard: false,
  setShowDashboard: () => {},
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

const AppProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [taxData, setTaxData] = useState<TaxData | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const uploadTaxFile = async (file: File) => {
    setShowDashboard(true);
    try {
      // 1. Extract text from PDF
      const text = await extractTextFromPdf(file);
      
      // 2. Get AI recommendations
      const response = await getChatCompletion(
        `${localStorage.getItem('customPrompt') || DEFAULT_PROMPT}\n\n${text}`
      );
      const markdown = response.choices[0].message.content;

      // 3. Generate PDF report
      const pdfBytes = await generateTaxPdf(markdown);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(blob);

      // 4. Update state with real data
      setTaxData({
        id: uuidv4(),
        fileName: file.name,
        uploadDate: new Date(),
        pdfReport: pdfBytes,
        pdfUrl,
        recommendations: markdown,
      });

      toast({
        title: 'Analysis complete',
        description: `Tax optimization report generated for ${file.name}`,
      });
    } catch (error) {
      toast({
        title: 'Processing failed',
        description: error instanceof Error ? error.message : 'Failed to generate report',
        variant: 'destructive',
      });
      setTaxData(null);
    }
  };

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        taxData,
        uploadTaxFile,
        showDashboard,
        setShowDashboard,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const AppProvider = React.memo(AppProviderInner);
