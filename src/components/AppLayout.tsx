import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import TaxOptimizationDashboard from './TaxOptimizationDashboard';

const AppLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen">
      <TaxOptimizationDashboard />
    </div>
  );
};

export default AppLayout;