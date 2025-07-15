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
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Deduction Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Upload a tax file to analyze deductions</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'claimed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'missed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'potential':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'claimed':
        return 'bg-green-100 text-green-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      case 'potential':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          Deduction Analyzer
        </CardTitle>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">${totalClaimed.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Claimed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">${totalMissed.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Missed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">${totalPotential.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Potential</div>
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
                <div key={deduction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(deduction.status)}
                    <div>
                      <div className="font-medium">{deduction.category}</div>
                      <div className="text-sm text-gray-600">{deduction.description}</div>
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
                <div className="text-center py-8 text-gray-500">
                  No deductions found for this category
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 pt-4 border-t">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Deduction
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeductionAnalyzer;