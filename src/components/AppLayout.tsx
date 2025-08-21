import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import TaxOptimizationDashboard from './TaxOptimizationDashboard';

interface AppLayoutProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, title, description }) => {
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {title && (
        <div className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6 animate-fade-in">
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              {description && (
                <p className="mt-2 text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children || <TaxOptimizationDashboard />}
      </main>
    </div>
  );
};

export default AppLayout;