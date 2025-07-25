'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, File, X, Check, AlertCircle, Clock, Search, Bot } from 'lucide-react';
import { uploadToStorage } from '@/services/api';
import useSession from '@/hooks/useSession';

interface DocumentUploadProps {
  onUploadComplete?: () => void;
  onUploadStart?: () => void;
}

type UploadStage = 'idle' | 'uploading' | 'indexing' | 'analyzing' | 'complete' | 'error';

const DocumentUpload = ({ onUploadComplete, onUploadStart }: DocumentUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<UploadStage>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { getSessionId } = useSession();
  
  const acceptedFormats = useMemo(() => ['.pdf', '.docx', '.txt'], []);
  const maxFileSize = useMemo(() => 500 * 1024 * 1024, []); // 500MB

  const getStageInfo = (stage: UploadStage) => {
    switch (stage) {
      case 'uploading':
        return {
          icon: Upload,
          title: 'Uploading Document',
          description: 'Securely uploading your file to Storage...',
          progress: uploadProgress
        };
      case 'indexing':
        return {
          icon: Search,
          title: 'Indexing Content',
          description: 'AI is analyzing and indexing your document for intelligent search...',
          progress: 70
        };
      case 'analyzing':
        return {
          icon: Bot,
          title: 'AI Analysis',
          description: 'Generating summary and extracting key topics from your document...',
          progress: 90
        };
      case 'complete':
        return {
          icon: Check,
          title: 'Ready to Chat!',
          description: 'Your document has been processed and is ready for intelligent conversation.',
          progress: 100
        };
      case 'error':
        return {
          icon: AlertCircle,
          title: 'Processing Failed',
          description: errorMessage || 'Something went wrong during document processing.',
          progress: 0
        };
      default:
        return {
          icon: Upload,
          title: 'Upload Your Document',
          description: 'Drag & drop or click to select your PDF, DOCX, or TXT file',
          progress: 0
        };
    }
  };

  const validateFile = useCallback((file: File): string | null => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!acceptedFormats.includes(fileExtension)) {
      return `Please upload a PDF, DOCX, or TXT file. ${fileExtension} is not supported.`;
    }

    if (file.size > maxFileSize) {
      return 'File size must be less than 500MB.';
    }

    return null;
  }, [acceptedFormats, maxFileSize]);

  const simulateUpload = useCallback(async (file: File) => {
    setUploadStage('uploading');
    setUploadProgress(0);
    setErrorMessage(null);
    onUploadStart?.(); // Notify parent that upload started
    
    const sessionId = await getSessionId();
    const formData = new FormData();
    formData.set('file', file);
    formData.set('sessionId', sessionId);
    
    try {
      // Stage 1: Upload
      await uploadToStorage(formData, progress => {
        setUploadProgress(Math.min(progress, 60)); // Cap at 60% for upload stage
      });
      
      // Stage 2: Indexing simulation
      setUploadStage('indexing');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate indexing time
      
      // Stage 3: AI Analysis simulation
      setUploadStage('analyzing');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate analysis time
      
      // Stage 4: Complete
      setUploadStage('complete');
      
      // Auto-proceed to chat after a brief delay
      setTimeout(() => {
        onUploadComplete?.();
      }, 1500);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStage('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process document. Please try again.');
    }
  }, [getSessionId, onUploadComplete, onUploadStart]);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);

    if (validationError) {
      setErrorMessage(validationError);
      setUploadStage('error');
      return;
    }

    await simulateUpload(file);
  }, [simulateUpload, validateFile]);

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
    setUploadProgress(0);
    setUploadStage('idle');
    setErrorMessage(null);
  };

  const stageInfo = getStageInfo(uploadStage);
  const StageIcon = stageInfo.icon;
  const isProcessing = ['uploading', 'indexing', 'analyzing'].includes(uploadStage);

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <Card 
        className={`relative border-2 border-dashed transition-all duration-200 ${
          isDragOver ? 'border-primary bg-primary/5 shadow-glow' : 
          uploadStage === 'complete' ? 'border-solid border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50' :
          uploadStage === 'error' ? 'border-solid border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50' :
          'border-border hover:border-primary/50'
        }`} 
        onDragOver={handleDragOver} 
        onDragLeave={handleDragLeave} 
        onDrop={handleDrop}
      >
        <div className="p-12 text-center">
          <div className="space-y-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-colors ${
              uploadStage === 'complete' ? 'bg-green-100 dark:bg-green-900' :
              uploadStage === 'error' ? 'bg-red-100 dark:bg-red-900' :
              isProcessing ? 'bg-primary/10' :
              isDragOver ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              <StageIcon className={`w-8 h-8 ${
                uploadStage === 'complete' ? 'text-green-600 dark:text-green-400' :
                uploadStage === 'error' ? 'text-red-600 dark:text-red-400' :
                isProcessing ? 'text-primary animate-pulse' :
                isDragOver ? '' : ''
              }`} />
            </div>
            
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${
                uploadStage === 'complete' ? 'text-green-700 dark:text-green-300' :
                uploadStage === 'error' ? 'text-red-700 dark:text-red-300' : ''
              }`}>
                {isDragOver ? 'Drop your document here' : stageInfo.title}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4">
                {stageInfo.description}
              </p>

              {isProcessing && (
                <div className="mb-4">
                  <Progress value={stageInfo.progress} className="w-full max-w-xs mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">{stageInfo.progress}% complete</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Please wait while we process your document...
                    </span>
                  </div>
                </div>
              )}

              {uploadStage === 'complete' && (
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => onUploadComplete?.()}>Start Chatting</Button>
                  <Button variant="outline" onClick={resetUpload}>
                    <X className="w-4 h-4 mr-2" />
                    Upload Another
                  </Button>
                </div>
              )}

              {uploadStage === 'error' && (
                <div className="flex gap-2 justify-center">
                  <Button onClick={resetUpload} variant="outline">
                    Try Again
                  </Button>
                </div>
              )}

              {uploadStage === 'idle' && !isProcessing && (
                <>
                  <input 
                    type="file" 
                    accept=".pdf,.docx,.txt" 
                    onChange={e => handleFileSelect(e.target.files)} 
                    className="hidden" 
                    id="file-upload" 
                    disabled={isProcessing}
                  />
                  <Button asChild variant="hero" size="lg" disabled={isProcessing}>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <File className="w-5 h-5 mr-2" />
                      Select Document
                    </label>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Format info */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">Supported formats:</p>
            <p className="text-muted-foreground">
              PDF (.pdf), Microsoft Word (.docx), Plain Text (.txt) • Maximum file size: 500MB
            </p>
            <p className="text-muted-foreground mt-2">
              <strong>Processing steps:</strong> Upload → AI Indexing → Content Analysis → Ready to Chat
            </p>
          </div>
        </div>
      </div>

      {/* Processing warning */}
      {isProcessing && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Please don&apos;t close this page</strong> - Document processing is in progress and may take a few minutes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;