import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentUpload from '@/components/DocumentUpload';
import ProcessingStatus from '@/components/ProcessingStatus';
import InspectionTemplate from '@/components/InspectionTemplate';
import { 
  FileText, 
  Bot, 
  Shield, 
  Clock,
  CheckCircle,
  BarChart3,
  Zap
} from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}

const mockProcessingSteps = [
  {
    id: 'ocr',
    name: 'Document OCR & Text Extraction',
    status: 'completed' as const,
    duration: '2.3s',
    description: 'Converting documents to machine-readable text'
  },
  {
    id: 'ai-analysis',
    name: 'AI Content Analysis',
    status: 'processing' as const,
    description: 'ChatGPT-5 Nano analyzing document content and structure'
  },
  {
    id: 'data-extraction',
    name: 'Structured Data Extraction',
    status: 'pending' as const,
    description: 'Extracting key information from bills of lading, invoices, certificates'
  },
  {
    id: 'template-generation',
    name: 'Template Generation',
    status: 'pending' as const,
    description: 'Generating inspection certificate from extracted data'
  }
];

const mockExtractedData = {
  supplier: 'Shenzhen SmartTech Co., Ltd.',
  buyer: 'EuroBuild Imports B.V.',
  inspectorName: 'Mehrdad M. / INS-145',
  invoiceNumber: 'INV-34789',
  purchaseOrderNumber: 'PO-2215',
  containerNo: 'CNU 2256987',
  billOfLadingNo: 'BL-567421',
  portOfLoading: 'Shenzhen, China',
  portOfDischarge: 'Rotterdam, Netherlands',
  incoterms: 'CIF Rotterdam',
  product: 'Smart LED Panels (Building Materials)',
  hsCode: '94054090',
  quantityDeclared: '2,000 pcs',
  packaging: 'Wooden Crates (20)',
  weight: '5,200 kg / 4,750 kg',
  packagingCondition: 'Good',
  labeling: 'Compliant with invoice & buyer requirements',
  physicalCondition: '3 units with minor scratches (cosmetic only)',
  sampleTesting: '20 pcs tested, all functional',
  compliance: 'Satisfactory',
  findings: 'Based on the inspection carried out on 06-Sep-2025 at Rotterdam Port Warehouse, the consignment described above has been inspected and found in generally good condition, with minor cosmetic defects noted.'
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processingStep, setProcessingStep] = useState(1);
  const [overallProgress, setOverallProgress] = useState(45);
  const [isEditing, setIsEditing] = useState(true);

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    // Auto-advance to processing after files are uploaded
    setTimeout(() => {
      setActiveTab('processing');
    }, 2000);
  };

  const handleSaveTemplate = (data: any) => {
    console.log('Template saved:', data);
  };

  const handleApproveTemplate = () => {
    console.log('Template approved');
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">AI Plus Inspection</h1>
                  <p className="text-sm text-muted-foreground">Intelligent Document Processing Platform</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Bot className="w-3 h-3" />
                <span>ChatGPT-5 Nano</span>
              </Badge>
              <Badge variant="outline">PoV Version</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 shadow-card">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-sm text-muted-foreground">Documents Processed</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 shadow-card">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">4.2s</p>
                <p className="text-sm text-muted-foreground">Avg Processing Time</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 shadow-card">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">98.7%</p>
                <p className="text-sm text-muted-foreground">Accuracy Rate</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 shadow-card">
            <div className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">87%</p>
                <p className="text-sm text-muted-foreground">Time Saved</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Workflow */}
        <Card className="shadow-elegant">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b px-6 py-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Upload Documents</span>
                </TabsTrigger>
                <TabsTrigger value="processing" className="flex items-center space-x-2">
                  <Bot className="w-4 h-4" />
                  <span>AI Processing</span>
                </TabsTrigger>
                <TabsTrigger value="template" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Inspection Certificate</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="upload" className="p-6">
              <DocumentUpload onFilesUploaded={handleFilesUploaded} />
              
              {uploadedFiles.length > 0 && (
                <div className="mt-6 flex justify-center">
                  <Button 
                    variant="gradient" 
                    size="lg"
                    onClick={() => setActiveTab('processing')}
                  >
                    Start AI Processing
                    <Bot className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="processing" className="p-6">
              <ProcessingStatus 
                steps={mockProcessingSteps}
                currentStep={processingStep}
                overallProgress={overallProgress}
              />
              
              <div className="mt-6 flex justify-center">
                <Button 
                  variant="gradient" 
                  size="lg"
                  onClick={() => setActiveTab('template')}
                >
                  View Generated Template
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="template" className="p-6">
              <InspectionTemplate
                extractedData={mockExtractedData}
                isEditing={isEditing}
                onSave={handleSaveTemplate}
                onApprove={handleApproveTemplate}
              />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Value Proposition */}
        <Card className="mt-8 p-6 bg-gradient-primary text-primary-foreground shadow-elegant">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Proof of Value Demonstration</h2>
            <p className="text-lg opacity-90">
              Experience how AI-powered document processing transforms goods inspection workflows
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">10x</div>
                <div className="text-sm opacity-80">Faster Processing</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">95%</div>
                <div className="text-sm opacity-80">Error Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">60%</div>
                <div className="text-sm opacity-80">Cost Savings</div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Index;