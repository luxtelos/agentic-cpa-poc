import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { generateTaxPdf } from '@/lib/perplexityApi';

interface TaxData {
  id: string;
  fileName: string;
  uploadDate: Date;
  totalIncome: number;
  currentTax: number;
  potentialSavings: number;
  optimizationScore: number;
  pdfReport: Uint8Array;
  deductions: {
    id: string;
    category: string;
    amount: number;
    description: string;
    status: 'claimed' | 'missed' | 'potential';
  }[];
  recommendations: {
    id: string;
    title: string;
    description: string;
    potentialSaving: number;
    priority: 'high' | 'medium' | 'low';
    implemented: boolean;
  }[];
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
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const pdfReport = new Uint8Array(0);
      if (!pdfReport || pdfReport.length === 0) {
        throw new Error('Failed to generate PDF report');
      }

      const mockTaxData: TaxData = {
        id: uuidv4(),
        fileName: file.name,
        uploadDate: new Date(),
        totalIncome: 850000,
        currentTax: 178500,
        potentialSavings: 23400,
        optimizationScore: 78,
        pdfReport,
        deductions: [
          {
            id: uuidv4(),
            category: 'Business Equipment',
            amount: 15000,
            description: 'Office computers and software',
            status: 'claimed'
          },
          {
            id: uuidv4(),
            category: 'Professional Services',
            amount: 8500,
            description: 'Legal and consulting fees',
            status: 'missed'
          },
          {
            id: uuidv4(),
            category: 'Research & Development',
            amount: 25000,
            description: 'R&D tax credit opportunity',
            status: 'potential'
          }
        ],
        recommendations: [
          {
            id: uuidv4(),
            title: 'Maximize R&D Tax Credits',
            description: 'Claim additional R&D credits for software development',
            potentialSaving: 12000,
            priority: 'high',
            implemented: false
          },
          {
            id: uuidv4(),
            title: 'Optimize Depreciation Schedule',
            description: 'Switch to accelerated depreciation for equipment',
            potentialSaving: 8400,
            priority: 'medium',
            implemented: false
          }
        ]
      };
      
      setTaxData(mockTaxData);
      setShowDashboard(true);
      
      toast({
        title: 'File processed successfully',
        description: `Analysis complete for ${file.name}`,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Please try again with a valid tax file',
        variant: 'destructive',
      });
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
