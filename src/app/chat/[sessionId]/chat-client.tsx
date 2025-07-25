'use client';
import MobileChatInterface from '@/components/MobileChatInterface';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';

export default function ChatClient({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  console.log(sessionId);
  const router = useRouter();

  useEffect(() => {
    if (!sessionId) {
      router.push('/upload');
      return;
    }
  }, [sessionId, router]);

  const handleBack = () => {
    router.push('/upload');
  };

  return (
    <main>
      <MobileChatInterface documentName={sessionId} onBack={handleBack} sessionId={sessionId} />
    </main>
  );
}