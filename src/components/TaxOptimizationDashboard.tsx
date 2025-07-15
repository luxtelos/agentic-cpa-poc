import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PdfViewer } from './PdfViewer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, DollarSign, Calculator, FileText, ArrowLeft } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import DeductionAnalyzer from './DeductionAnalyzer';
import TaxStrategies from './TaxStrategies';

const TaxOptimizationDashboard: React.FC = () => {
  const { taxData, setShowDashboard } = useAppContext();
  const [revenue, setRevenue] = useState('');
  const [expenses, setExpenses] = useState('');

  if (!taxData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">No tax data available</h2>
          <Button onClick={() => setShowDashboard(false)} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </Button>
        </div>
      </div>
    );
  }

  const calculateOptimization = () => {
    const rev = parseFloat(revenue) || 0;
    const exp = parseFloat(expenses) || 0;
    const savings = Math.floor((rev - exp) * 0.15);
    // Update would go here in a real implementation
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Smart Tax Optimization
            </h1>
            <p className="text-gray-600 text-lg">Analysis for {taxData.fileName}</p>
            <p className="text-gray-500 text-sm">Uploaded on {taxData.uploadDate.toLocaleDateString()}</p>
          </div>
          <Button 
            onClick={() => setShowDashboard(false)} 
            variant="outline"
            className="bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-400 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5" />
                Potential Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${taxData.potentialSavings.toLocaleString()}</div>
              <p className="text-green-100 text-sm">This tax year</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-400 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5" />
                Optimization Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{taxData.optimizationScore}%</div>
              <Progress value={taxData.optimizationScore} className="mt-2 bg-blue-300" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-400 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Deductions Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{taxData.deductions.length}</div>
              <p className="text-purple-100 text-sm">Eligible deductions</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                Tax Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Total Income:</span>
                <span className="text-lg font-bold">${taxData.totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Current Tax:</span>
                <span className="text-lg font-bold text-red-600">${taxData.currentTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Potential Savings:</span>
                <span className="text-lg font-bold text-green-600">${taxData.potentialSavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Optimized Tax:</span>
                <span className="text-lg font-bold text-blue-600">${(taxData.currentTax - taxData.potentialSavings).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Top Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {taxData.recommendations.map((rec) => (
                  <div key={rec.id} className={`flex items-center justify-between p-3 rounded-lg ${
                    rec.priority === 'high' ? 'bg-red-50' : 
                    rec.priority === 'medium' ? 'bg-yellow-50' : 'bg-green-50'
                  }`}>
                    <div>
                      <span className="text-sm font-medium">{rec.title}</span>
                      <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                    </div>
                    <Badge className={`${
                      rec.priority === 'high' ? 'bg-red-600' : 
                      rec.priority === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                    }`}>
                      ${rec.potentialSaving.toLocaleString()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DeductionAnalyzer />
          <TaxStrategies />
        </div>

        <Card className="border-0 shadow-xl mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Tax Optimization Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[600px]">
              {taxData.pdfReport && taxData.pdfReport.length > 0 ? (
                <PdfViewer pdfData={taxData.pdfReport} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Generating PDF report...</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaxOptimizationDashboard;
