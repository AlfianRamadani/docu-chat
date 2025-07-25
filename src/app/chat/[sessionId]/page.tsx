import { Metadata } from 'next';
import { generateMetadata as createMetadata, pageMetadata } from '@/lib/seo';
import ChatClient from './chat-client';

export async function generateMetadata({ params }: { params: Promise<{ sessionId: string }> }): Promise<Metadata> {
  const { sessionId } = await params;
  
  return createMetadata({
    ...pageMetadata.chat,
    title: `Chat Session ${sessionId}`,
    description: `Continue your conversation with your uploaded document in session ${sessionId}. Ask questions and get AI-powered insights.`,
  });
}

export default function ChatPage({ params }: { params: Promise<{ sessionId: string }> }) {
  return <ChatClient params={params} />;
}
