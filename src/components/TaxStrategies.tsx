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
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-600" />
            Tax Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Upload a tax file to see optimization strategies</p>
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
        return 'bg-error-600';
      case 'medium':
        return 'bg-warning-600';
      case 'low':
        return 'bg-success-600';
      default:
        return 'bg-muted';
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
    <Card className="border-0 shadow-lg animate-slide-in-from-right">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-600" />
          Tax Strategies
        </CardTitle>
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Implementation Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(implementationProgress)}%</span>
          </div>
          <Progress value={implementationProgress} className="h-2" />
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className="text-muted-foreground">Implemented: ${implementedSavings.toLocaleString()}</span>
            <span className="text-muted-foreground">Total: ${totalPotentialSavings.toLocaleString()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {taxData.recommendations.map((strategy) => {
            const isImplemented = implementedStrategies.includes(strategy.id);
            return (
              <div key={strategy.id} className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                isImplemented ? 'bg-success-50 border-success-200' : 'bg-card border-border'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(strategy.priority)}
                    <h3 className="font-semibold text-foreground">{strategy.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(strategy.priority)}>
                      {strategy.priority}
                    </Badge>
                    <span className="font-bold text-success-600">
                      ${strategy.potentialSaving.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isImplemented && (
                      <CheckCircle className="w-4 h-4 text-success-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      isImplemented ? 'text-success-600' : 'text-muted-foreground'
                    }`}>
                      {isImplemented ? 'Implemented' : 'Not Implemented'}
                    </span>
                  </div>
                  
                  <Button
                    size="sm"
                    variant={isImplemented ? 'outline' : 'default'}
                    onClick={() => toggleImplementation(strategy.id)}
                    className={isImplemented ? 'border-success-600 text-success-600 hover:bg-success-50' : ''}
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
              <div className="text-2xl font-bold text-primary-600">
                {taxData.recommendations.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Strategies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">
                {implementedStrategies.length}
              </div>
              <div className="text-sm text-muted-foreground">Implemented</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxStrategies;