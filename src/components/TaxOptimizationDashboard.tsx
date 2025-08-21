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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">
              Smart Tax Optimization
            </h1>
            <p className="text-muted-foreground text-lg">Analysis for {taxData.fileName}</p>
            <p className="text-muted-foreground text-sm">Uploaded on {taxData.uploadDate.toLocaleDateString()}</p>
          </div>
          <Button 
            onClick={() => setShowDashboard(false)} 
            variant="outline"
            className="bg-card hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-success-500 to-success-600 text-white animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5" />
                Potential Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${taxData.potentialSavings.toLocaleString()}</div>
              <p className="text-success-50 text-sm">This tax year</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary-500 to-primary-600 text-white animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5" />
                Optimization Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{taxData.optimizationScore}%</div>
              <Progress value={taxData.optimizationScore} className="mt-2 bg-primary-200" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary-400 to-primary-500 text-white animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Deductions Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{taxData.deductions.length}</div>
              <p className="text-primary-50 text-sm">Eligible deductions</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-lg animate-slide-in-from-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary-600" />
                Tax Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="font-medium">Total Income:</span>
                <span className="text-lg font-bold">${taxData.totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="font-medium">Current Tax:</span>
                <span className="text-lg font-bold text-error-600">${taxData.currentTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-success-50 rounded-lg">
                <span className="font-medium">Potential Savings:</span>
                <span className="text-lg font-bold text-success-600">${taxData.potentialSavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                <span className="font-medium">Optimized Tax:</span>
                <span className="text-lg font-bold text-primary-600">${(taxData.currentTax - taxData.potentialSavings).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg animate-slide-in-from-right">
            <CardHeader>
              <CardTitle>Top Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {taxData.recommendations.map((rec) => (
                  <div key={rec.id} className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
                    rec.priority === 'high' ? 'bg-error-50' : 
                    rec.priority === 'medium' ? 'bg-warning-50' : 'bg-success-50'
                  }`}>
                    <div>
                      <span className="text-sm font-medium">{rec.title}</span>
                      <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                    </div>
                    <Badge className={`transition-colors ${
                      rec.priority === 'high' ? 'bg-error-600 hover:bg-error-700' : 
                      rec.priority === 'medium' ? 'bg-warning-600 hover:bg-warning-700' : 'bg-success-600 hover:bg-success-700'
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

        <Card className="border-0 shadow-lg mt-6 animate-slide-in-from-bottom">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Generating PDF report...</p>
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
