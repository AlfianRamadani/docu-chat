'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';
import { uploadToStorage } from '@/services/api';
import useSession from '@/hooks/useSession';

interface DocumentUploadProps {
  onUploadComplete?: () => void;
}

const DocumentUpload = ({ onUploadComplete }: DocumentUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const { getSessionId } = useSession();
  const acceptedFormats = ['.pdf', '.docx', '.txt'];
  const maxFileSize = 500 * 1024 * 1024; // 10MB
  const validateFile = (file: File): string | null => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!acceptedFormats.includes(fileExtension)) {
      return `Please upload a PDF, DOCX, or TXT file. ${fileExtension} is not supported.`;
    }

    if (file.size > maxFileSize) {
      return 'File size must be less than 10MB.';
    }

    return null;
  };

  const simulateUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    const sessionId = await getSessionId();
    const formData = new FormData();
    formData.set('file', file);
    formData.set('sessionId', sessionId);
    
    try {
      await uploadToStorage(formData, progress => {
        setUploadProgress(progress);
      });
      
      setIsUploading(false);
      setUploadedFile(file.name);
      onUploadComplete?.();

      // toast({
      //   title: 'Document processed successfully!',
      //   description: `${file.name} has been analyzed and is ready for intelligent chat.`
      // });
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      
      // toast({
      //   title: 'Upload Error',
      //   description: 'Failed to process document. Please try again.',
      //   variant: 'destructive'
      // });
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);

    if (validationError) {
      // toast({
      //   title: 'Upload Error',
      //   description: validationError,
      //   variant: 'destructive'
      // });
      return;
    }

    await simulateUpload(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    await handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <Card className={`relative border-2 border-dashed transition-all duration-200 ${isDragOver ? 'border-primary bg-primary/5 shadow-glow' : 'border-border hover:border-primary/50'} ${uploadedFile ? 'border-solid border-green-200 bg-green-50/50' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        <div className="p-12 text-center">
          {uploadedFile ? (
            // Success state
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-700 mb-2">Upload Complete!</h3>
                <p className="text-sm text-muted-foreground mb-4">{uploadedFile} is ready for chatting</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => onUploadComplete?.()}>Start Chatting</Button>
                  <Button variant="outline" onClick={resetUpload}>
                    <X className="w-4 h-4 mr-2" />
                    Upload Another
                  </Button>
                </div>
              </div>
            </div>
          ) : isUploading ? (
            // Uploading state
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Processing Document</h3>
                <p className="text-sm text-muted-foreground mb-4">Uploading to Azure Storage, indexing with AI Search, and analyzing with Azure AI...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                <p className="text-xs text-muted-foreground mt-2">{uploadProgress}% complete</p>
              </div>
            </div>
          ) : (
            // Default upload state
            <div className="space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-colors ${isDragOver ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{isDragOver ? 'Drop your document here' : 'Upload Your Document'}</h3>
                <p className="text-sm text-muted-foreground mb-6">Drag & drop or click to select your PDF, DOCX, or TXT file</p>
                <input type="file" accept=".pdf,.docx,.txt" onChange={e => handleFileSelect(e.target.files)} className="hidden" id="file-upload" />
                <Button asChild variant="hero" size="lg">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <File className="w-5 h-5 mr-2" />
                    Select Document
                  </label>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Format info */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">Supported formats:</p>
            <p className="text-muted-foreground">PDF (.pdf), Microsoft Word (.docx), Plain Text (.txt) • Maximum file size: 10MB</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
