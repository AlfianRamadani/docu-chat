import { NextRequest, NextResponse } from 'next/server';
import chatService from '../../../services/chat/chatService';
import documentProcessingService from '../../../services/documentProcessingService';
import { CreateChatSessionRequest, SaveMessageRequest, Message } from '../../../types/chat';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create':
        return await handleCreateSession(data as CreateChatSessionRequest);

      case 'save_message':
        return await handleSaveMessage(data as SaveMessageRequest);

      case 'restore':
        return await handleRestoreSession(data.sessionId);

      case 'initialize':
        return await handleInitializeSession(data.sessionId, data.documentName);

      case 'generate_response':
        return await handleGenerateResponse(data.sessionId, data.userMessage, data.conversationHistory);

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (sessionId) {
      // Restore specific session
      const result = await chatService.restoreChatSession(sessionId);
      return NextResponse.json(result);
    } else {
      // Get all sessions for user
      const sessions = await chatService.getChatSessions(userId || undefined);
      return NextResponse.json({ success: true, sessions });
    }
  } catch (error) {
    console.error('Chat API GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID is required' }, { status: 400 });
    }

    const success = await chatService.deleteChatSession(sessionId);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Chat API DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

async function handleCreateSession(data: CreateChatSessionRequest) {
  try {
    const session = await chatService.createChatSession(data);
    return NextResponse.json({ success: true, session });
  } catch (err) {
    console.error('Create session error:', err);
    return NextResponse.json({ success: false, error: 'Failed to create session' }, { status: 500 });
  }
}

async function handleSaveMessage(data: SaveMessageRequest) {
  try {
    const success = await chatService.saveMessage(data);
    return NextResponse.json({ success });
  } catch (err) {
    console.error('Save message error:', err);
    return NextResponse.json({ success: false, error: 'Failed to save message' }, { status: 500 });
  }
}

async function handleRestoreSession(sessionId: string) {
  try {
    const result = await chatService.restoreChatSession(sessionId);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Restore session error:', err);
    return NextResponse.json({ success: false, error: 'Failed to restore session' }, { status: 500 });
  }
}

async function handleInitializeSession(sessionId: string, documentName: string) {
  try {
    const session = await chatService.initializeChatSession(sessionId, documentName);
    return NextResponse.json({ success: true, session });
  } catch (err) {
    console.error('Initialize session error:', err);
    return NextResponse.json({ success: false, error: 'Failed to initialize session' }, { status: 500 });
  }
}

async function handleGenerateResponse(sessionId: string, userMessage: string, conversationHistory: Message[]) {
  try {
    const result = await documentProcessingService.generateContextualResponse(
      sessionId,
      userMessage,
      conversationHistory
    );
    
    return NextResponse.json({ 
      success: true, 
      response: result.response,
      citations: result.citations,
      sources: result.sources
    });
  } catch (err) {
    console.error('Generate response error:', err);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate response',
      response: "I apologize, but I'm having trouble generating a response right now. Please try again."
    }, { status: 500 });
  }
}
