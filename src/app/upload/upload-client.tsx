'use client';
import DocumentUpload from '@/components/DocumentUpload';
import ThemeToggle from '@/components/ThemeToggle';
import { useRouter } from 'next/navigation';
import useSession from '../../hooks/useSession';
import { useEffect, useState } from 'react';

const UploadClient = () => {
  const { sessionId, isLoading } = useSession();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (sessionId && !isProcessing) {
      router.push(`/chat/${sessionId}`);
    }
  }, [isLoading, router, sessionId, isProcessing]);
  
  const handleUploadComplete = () => {
    setIsProcessing(false);
    router.push(`/chat/${sessionId}`);
  };

  const handleUploadStart = () => {
    setIsProcessing(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex flex-col">
      {/* Header with theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="container mx-auto px-6">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Upload Your Document</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose a PDF, Word document, or text file to start chatting with your content. 
              Our AI will analyze and index your document for intelligent conversations.
            </p>
          </header>

          <section>
            <DocumentUpload 
              onUploadComplete={handleUploadComplete}
              onUploadStart={handleUploadStart}
            />
          </section>
        </div>
      </div>
    </main>
  );
};

export default UploadClient;