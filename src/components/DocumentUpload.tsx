import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadedFile extends File {
  id: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}

interface DocumentUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onFilesUploaded }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploading' as const,
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach(file => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === file.id 
                ? { ...f, status: 'completed', progress: 100 }
                : f
            )
          );
        } else {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === file.id 
                ? { ...f, progress }
                : f
            )
          );
        }
      }, 200);
    });

    onFilesUploaded(newFiles);
    toast({
      title: "Files uploaded",
      description: `${acceptedFiles.length} document(s) uploaded successfully`,
    });
  }, [onFilesUploaded, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-8 border-2 border-dashed border-muted hover:border-primary transition-smooth shadow-card">
        <div
          {...getRootProps()}
          className={`cursor-pointer text-center space-y-4 ${
            isDragActive ? 'opacity-70' : ''
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex justify-center">
            <Upload className={`w-12 h-12 ${isDragActive ? 'text-primary' : 'text-muted-foreground'} transition-smooth`} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {isDragActive ? 'Drop your documents here' : 'Upload Documents'}
            </h3>
            <p className="text-muted-foreground">
              Drag & drop or click to select Bills of Lading, Invoices, Certificates, and other inspection documents
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PDF, Images, Word documents
            </p>
          </div>
          <Button variant="gradient" size="lg">
            <Upload className="w-4 h-4" />
            Browse Files
          </Button>
        </div>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card className="p-6 shadow-card">
          <h4 className="text-lg font-semibold mb-4">Uploaded Documents</h4>
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                <FileText className="w-8 h-8 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(file.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={file.progress} className="flex-1" />
                    <span className="text-xs text-muted-foreground w-12">
                      {Math.round(file.progress)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DocumentUpload;