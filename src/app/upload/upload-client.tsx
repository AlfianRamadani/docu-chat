'use client';
import DocumentUpload from '@/components/DocumentUpload';
import { useRouter } from 'next/navigation';
import useSession from '../../hooks/useSession';
import { useEffect } from 'react';

const UploadClient = () => {
  const { sessionId, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (sessionId) {
      router.push(`/chat/${sessionId}`);
    }
  }, [isLoading, router, sessionId]);
  
  const handleUploadComplete = () => {
    router.push(`/chat/${sessionId}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex flex-col">
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="container mx-auto px-6">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Upload Your Document</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose a PDF, Word document, or text file to start chatting with your content.
            </p>
          </header>

          <section>
            <DocumentUpload onUploadComplete={handleUploadComplete} />
          </section>
        </div>
      </div>
    </main>
  );
};

export default UploadClient;