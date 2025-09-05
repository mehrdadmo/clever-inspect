import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Bot, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  duration?: string;
  description: string;
}

interface ProcessingStatusProps {
  steps: ProcessingStep[];
  currentStep: number;
  overallProgress: number;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  steps,
  currentStep,
  overallProgress
}) => {
  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-muted-foreground" />;
      case 'processing':
        return <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
    }
  };

  const getStatusBadge = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'processing':
        return <Badge variant="default" className="bg-gradient-processing">Processing</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-success">Completed</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Bot className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">AI Document Processing</h3>
            <p className="text-muted-foreground">ChatGPT-5 Nano is analyzing your documents</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg border transition-smooth ${
                index === currentStep
                  ? 'border-primary bg-primary/5 shadow-processing'
                  : 'border-border bg-background'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStepIcon(step.status)}
                  <div>
                    <h4 className="font-medium">{step.name}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {step.duration && (
                    <span className="text-xs text-muted-foreground">{step.duration}</span>
                  )}
                  {getStatusBadge(step.status)}
                </div>
              </div>
              
              {step.status === 'processing' && (
                <div className="mt-3">
                  <Progress value={75} className="h-1" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Processing Strategy</p>
              <p className="text-sm text-muted-foreground">
                Our AI extracts structured data from Bills of Lading, Invoices, and Certificates,
                then maps the information to your inspection template format for human review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProcessingStatus;