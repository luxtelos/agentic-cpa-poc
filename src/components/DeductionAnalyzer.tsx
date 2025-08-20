import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

const DeductionAnalyzer: React.FC = () => {
  const { taxData } = useAppContext();
  const [activeTab, setActiveTab] = useState('all');

  if (!taxData) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary-600" />
            Deduction Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Upload a tax file to analyze deductions</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'claimed':
        return <CheckCircle className="w-4 h-4 text-success-600" />;
      case 'missed':
        return <XCircle className="w-4 h-4 text-error-600" />;
      case 'potential':
        return <AlertCircle className="w-4 h-4 text-warning-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'claimed':
        return 'bg-success-100 text-success-800';
      case 'missed':
        return 'bg-error-100 text-error-800';
      case 'potential':
        return 'bg-warning-100 text-warning-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredDeductions = activeTab === 'all' 
    ? taxData.deductions 
    : taxData.deductions.filter(d => d.status === activeTab);

  const totalClaimed = taxData.deductions
    .filter(d => d.status === 'claimed')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalMissed = taxData.deductions
    .filter(d => d.status === 'missed')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalPotential = taxData.deductions
    .filter(d => d.status === 'potential')
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <Card className="border-0 shadow-lg animate-slide-in-from-left">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary-600" />
          Deduction Analyzer
        </CardTitle>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-success-600">${totalClaimed.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Claimed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-error-600">${totalMissed.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Missed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning-600">${totalPotential.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Potential</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="claimed">Claimed</TabsTrigger>
            <TabsTrigger value="missed">Missed</TabsTrigger>
            <TabsTrigger value="potential">Potential</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredDeductions.map((deduction) => (
                <div key={deduction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-accent transition-all duration-200 hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(deduction.status)}
                    <div>
                      <div className="font-medium">{deduction.category}</div>
                      <div className="text-sm text-muted-foreground">{deduction.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(deduction.status)}>
                      {deduction.status}
                    </Badge>
                    <span className="font-bold text-lg">${deduction.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              
              {filteredDeductions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No deductions found for this category
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 pt-4 border-t">
          <Button className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all duration-200">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Deduction
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeductionAnalyzer;