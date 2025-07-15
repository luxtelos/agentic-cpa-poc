import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

const TaxStrategies: React.FC = () => {
  const { taxData } = useAppContext();
  const [implementedStrategies, setImplementedStrategies] = useState<string[]>([]);

  if (!taxData) {
    return (
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Tax Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Upload a tax file to see optimization strategies</p>
        </CardContent>
      </Card>
    );
  }

  const toggleImplementation = (strategyId: string) => {
    setImplementedStrategies(prev => 
      prev.includes(strategyId) 
        ? prev.filter(id => id !== strategyId)
        : [...prev, strategyId]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-600';
      case 'medium':
        return 'bg-yellow-600';
      case 'low':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <TrendingUp className="w-4 h-4" />;
      case 'medium':
        return <Clock className="w-4 h-4" />;
      case 'low':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const totalPotentialSavings = taxData.recommendations.reduce((sum, rec) => sum + rec.potentialSaving, 0);
  const implementedSavings = taxData.recommendations
    .filter(rec => implementedStrategies.includes(rec.id))
    .reduce((sum, rec) => sum + rec.potentialSaving, 0);
  
  const implementationProgress = totalPotentialSavings > 0 
    ? (implementedSavings / totalPotentialSavings) * 100 
    : 0;

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Tax Strategies
        </CardTitle>
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Implementation Progress</span>
            <span className="text-sm text-gray-600">{Math.round(implementationProgress)}%</span>
          </div>
          <Progress value={implementationProgress} className="h-2" />
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className="text-gray-600">Implemented: ${implementedSavings.toLocaleString()}</span>
            <span className="text-gray-600">Total: ${totalPotentialSavings.toLocaleString()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {taxData.recommendations.map((strategy) => {
            const isImplemented = implementedStrategies.includes(strategy.id);
            return (
              <div key={strategy.id} className={`p-4 rounded-lg border transition-all ${
                isImplemented ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(strategy.priority)}
                    <h3 className="font-semibold text-gray-900">{strategy.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(strategy.priority)}>
                      {strategy.priority}
                    </Badge>
                    <span className="font-bold text-green-600">
                      ${strategy.potentialSaving.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isImplemented && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      isImplemented ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {isImplemented ? 'Implemented' : 'Not Implemented'}
                    </span>
                  </div>
                  
                  <Button
                    size="sm"
                    variant={isImplemented ? 'outline' : 'default'}
                    onClick={() => toggleImplementation(strategy.id)}
                    className={isImplemented ? 'border-green-600 text-green-600 hover:bg-green-50' : ''}
                  >
                    {isImplemented ? 'Mark as Pending' : 'Mark as Implemented'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {taxData.recommendations.length}
              </div>
              <div className="text-sm text-gray-600">Total Strategies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {implementedStrategies.length}
              </div>
              <div className="text-sm text-gray-600">Implemented</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxStrategies;