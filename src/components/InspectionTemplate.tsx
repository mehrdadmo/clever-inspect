import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  FileText, 
  Edit3, 
  Save, 
  CheckCircle, 
  Download,
  Eye,
  AlertCircle
} from 'lucide-react';

interface ExtractedData {
  certificateNo: string;
  dateOfIssue: string;
  supplier: string;
  buyer: string;
  inspectionCompany: string;
  inspectorName: string;
  invoiceNumber: string;
  purchaseOrderNumber: string;
  containerNo: string;
  billOfLadingNo: string;
  portOfLoading: string;
  portOfDischarge: string;
  modeOfTransport: string;
  incoterms: string;
  product: string;
  hsCode: string;
  quantityDeclared: string;
  packaging: string;
  weight: string;
  packagingCondition: string;
  labeling: string;
  physicalCondition: string;
  sampleTesting: string;
  compliance: string;
  findings: string;
}

interface InspectionTemplateProps {
  extractedData: Partial<ExtractedData>;
  isEditing: boolean;
  onSave: (data: ExtractedData) => void;
  onApprove: () => void;
}

const InspectionTemplate: React.FC<InspectionTemplateProps> = ({
  extractedData,
  isEditing,
  onSave,
  onApprove
}) => {
  const [formData, setFormData] = useState<ExtractedData>({
    certificateNo: extractedData.certificateNo || 'IC-2025-0091',
    dateOfIssue: extractedData.dateOfIssue || new Date().toLocaleDateString('en-GB'),
    supplier: extractedData.supplier || '',
    buyer: extractedData.buyer || '',
    inspectionCompany: extractedData.inspectionCompany || 'AI Plus Inspection Services',
    inspectorName: extractedData.inspectorName || '',
    invoiceNumber: extractedData.invoiceNumber || '',
    purchaseOrderNumber: extractedData.purchaseOrderNumber || '',
    containerNo: extractedData.containerNo || '',
    billOfLadingNo: extractedData.billOfLadingNo || '',
    portOfLoading: extractedData.portOfLoading || '',
    portOfDischarge: extractedData.portOfDischarge || '',
    modeOfTransport: extractedData.modeOfTransport || 'Sea',
    incoterms: extractedData.incoterms || '',
    product: extractedData.product || '',
    hsCode: extractedData.hsCode || '',
    quantityDeclared: extractedData.quantityDeclared || '',
    packaging: extractedData.packaging || '',
    weight: extractedData.weight || '',
    packagingCondition: extractedData.packagingCondition || '',
    labeling: extractedData.labeling || '',
    physicalCondition: extractedData.physicalCondition || '',
    sampleTesting: extractedData.sampleTesting || '',
    compliance: extractedData.compliance || '',
    findings: extractedData.findings || ''
  });

  const [editingFields, setEditingFields] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleFieldEdit = (fieldName: string) => {
    if (isEditing) {
      setEditingFields(prev => new Set(prev).add(fieldName));
    }
  };

  const handleFieldSave = (fieldName: string) => {
    setEditingFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(fieldName);
      return newSet;
    });
  };

  const handleInputChange = (fieldName: keyof ExtractedData, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    toast({
      title: "Draft saved",
      description: "Inspection certificate draft has been saved successfully",
    });
  };

  const handleApprove = () => {
    onApprove();
    toast({
      title: "Certificate approved",
      description: "Inspection certificate has been approved and is ready for issuance",
    });
  };

  const FieldInput = ({ 
    fieldName, 
    value, 
    placeholder, 
    multiline = false 
  }: { 
    fieldName: keyof ExtractedData;
    value: string;
    placeholder: string;
    multiline?: boolean;
  }) => {
    const isFieldEditing = editingFields.has(fieldName);
    
    if (!isEditing || !isFieldEditing) {
      return (
        <div 
          className="min-h-[2rem] px-3 py-2 border border-transparent rounded hover:border-muted-foreground/20 cursor-pointer transition-smooth flex items-center justify-between group"
          onClick={() => handleFieldEdit(fieldName)}
        >
          <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
            {value || placeholder}
          </span>
          {isEditing && (
            <Edit3 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-smooth" />
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        {multiline ? (
          <Textarea
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            placeholder={placeholder}
            className="flex-1"
            rows={3}
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFieldSave(fieldName)}
        >
          <Save className="w-3 h-3" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Inspection Certificate Draft</h3>
              <p className="text-muted-foreground">Review and edit extracted information</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <AlertCircle className="w-3 h-3" />
              <span>Draft</span>
            </Badge>
          </div>
        </div>

        <div className="bg-gradient-subtle rounded-lg p-6 border space-y-6">
          <div className="text-center border-b pb-4">
            <h2 className="text-xl font-bold">📄 INSPECTION CERTIFICATE</h2>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Certificate No.:</strong> 
                <FieldInput fieldName="certificateNo" value={formData.certificateNo} placeholder="IC-2025-XXXX" />
              </div>
              <div>
                <strong>Date of Issue:</strong>
                <FieldInput fieldName="dateOfIssue" value={formData.dateOfIssue} placeholder="DD-MMM-YYYY" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">1. Parties Involved</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Supplier / Exporter:</strong>
                <FieldInput fieldName="supplier" value={formData.supplier} placeholder="Company Name" />
              </div>
              <div>
                <strong>Buyer / Importer:</strong>
                <FieldInput fieldName="buyer" value={formData.buyer} placeholder="Company Name" />
              </div>
              <div>
                <strong>Inspection Company:</strong>
                <FieldInput fieldName="inspectionCompany" value={formData.inspectionCompany} placeholder="Inspection Company" />
              </div>
              <div>
                <strong>Inspector Name / ID:</strong>
                <FieldInput fieldName="inspectorName" value={formData.inspectorName} placeholder="Inspector Name / ID" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">2. Shipment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Invoice Number:</strong>
                <FieldInput fieldName="invoiceNumber" value={formData.invoiceNumber} placeholder="INV-XXXXX" />
              </div>
              <div>
                <strong>Purchase Order Number:</strong>
                <FieldInput fieldName="purchaseOrderNumber" value={formData.purchaseOrderNumber} placeholder="PO-XXXXX" />
              </div>
              <div>
                <strong>Container / Consignment No.:</strong>
                <FieldInput fieldName="containerNo" value={formData.containerNo} placeholder="Container Number" />
              </div>
              <div>
                <strong>Bill of Lading No.:</strong>
                <FieldInput fieldName="billOfLadingNo" value={formData.billOfLadingNo} placeholder="BL-XXXXX" />
              </div>
              <div>
                <strong>Port of Loading:</strong>
                <FieldInput fieldName="portOfLoading" value={formData.portOfLoading} placeholder="Port, Country" />
              </div>
              <div>
                <strong>Port of Discharge:</strong>
                <FieldInput fieldName="portOfDischarge" value={formData.portOfDischarge} placeholder="Port, Country" />
              </div>
              <div>
                <strong>Mode of Transport:</strong>
                <FieldInput fieldName="modeOfTransport" value={formData.modeOfTransport} placeholder="Sea/Air/Land" />
              </div>
              <div>
                <strong>Incoterms:</strong>
                <FieldInput fieldName="incoterms" value={formData.incoterms} placeholder="CIF/FOB/EXW" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">3. Goods Inspected</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Product:</strong>
                <FieldInput fieldName="product" value={formData.product} placeholder="Product Description" />
              </div>
              <div>
                <strong>HS Code:</strong>
                <FieldInput fieldName="hsCode" value={formData.hsCode} placeholder="HS Code" />
              </div>
              <div>
                <strong>Quantity Declared / Inspected:</strong>
                <FieldInput fieldName="quantityDeclared" value={formData.quantityDeclared} placeholder="Quantity" />
              </div>
              <div>
                <strong>Packaging:</strong>
                <FieldInput fieldName="packaging" value={formData.packaging} placeholder="Packaging Type" />
              </div>
              <div className="md:col-span-2">
                <strong>Weight (Gross / Net):</strong>
                <FieldInput fieldName="weight" value={formData.weight} placeholder="Weight Details" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">4. Inspection Findings</h3>
            <div className="space-y-4 text-sm">
              <div>
                <strong>Packaging Condition:</strong>
                <FieldInput fieldName="packagingCondition" value={formData.packagingCondition} placeholder="Packaging Condition" />
              </div>
              <div>
                <strong>Labeling:</strong>
                <FieldInput fieldName="labeling" value={formData.labeling} placeholder="Labeling Status" />
              </div>
              <div>
                <strong>Physical Condition:</strong>
                <FieldInput fieldName="physicalCondition" value={formData.physicalCondition} placeholder="Physical Condition" />
              </div>
              <div>
                <strong>Sample Testing:</strong>
                <FieldInput fieldName="sampleTesting" value={formData.sampleTesting} placeholder="Testing Results" />
              </div>
              <div>
                <strong>Compliance with PO & Invoice:</strong>
                <FieldInput fieldName="compliance" value={formData.compliance} placeholder="Compliance Status" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">5. Certification</h3>
            <div className="text-sm">
              <strong>Findings Summary:</strong>
              <FieldInput 
                fieldName="findings" 
                value={formData.findings} 
                placeholder="Based on the inspection carried out..."
                multiline
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6 pt-6 border-t">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={handleSave}>
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
            <Button variant="success" onClick={handleApprove}>
              <CheckCircle className="w-4 h-4" />
              Approve & Issue
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InspectionTemplate;