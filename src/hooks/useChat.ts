import { useState, useCallback } from 'react';
import { Message, ChatSession, RestoreChatResponse } from '../types/chat';
import { DocumentSearchResult } from '../services/documentProcessingService';

interface UseChatReturn {
  loading: boolean;
  error: string | null;
  saveMessage: (sessionId: string, message: Message) => Promise<boolean>;
  restoreChat: (sessionId: string) => Promise<ChatSession | null>;
  initializeSession: (sessionId: string, documentName: string) => Promise<ChatSession | null>;
  createSession: (sessionId: string, documentName: string, userId?: string) => Promise<ChatSession | null>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  getAllSessions: (userId?: string) => Promise<ChatSession[]>;
  generateResponse: (sessionId: string, userMessage: string, conversationHistory: Message[]) => Promise<{
    response: string;
    citations: string[];
    sources: DocumentSearchResult[];
  } | null>;
}

export const useChat = (): UseChatReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Don't treat "Chat session not found" as an error - it's expected for new sessions
      if (!data.success && data.error && data.error.includes('Chat session not found')) {
        console.log('No existing session found - this is expected for new sessions');
        return { success: false, session: null };
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Operation failed');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('API call error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveMessage = useCallback(async (sessionId: string, message: Message): Promise<boolean> => {
    try {
      const result = await apiCall('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          action: 'save_message',
          sessionId,
          message
        }),
      });
      
      return result.success;
    } catch (error) {
      console.error('Error saving message:', error);
      return false;
    }
  }, [apiCall]);

  const restoreChat = useCallback(async (sessionId: string): Promise<ChatSession | null> => {
    try {
      const result: RestoreChatResponse = await apiCall(`/api/chat?sessionId=${encodeURIComponent(sessionId)}`);
      
      // Handle the case where no session is found (normal for new sessions)
      if (!result.success || !result.session) {
        console.log('No existing session found, will create new one');
        return null;
      }
      
      return result.session;
    } catch (error) {
      // This should rarely happen now since we handle "not found" in apiCall
      console.error('Error restoring chat:', error);
      return null;
    }
  }, [apiCall]);

  const initializeSession = useCallback(async (sessionId: string, documentName: string): Promise<ChatSession | null> => {
    try {
      const result = await apiCall('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          action: 'initialize',
          sessionId,
          documentName
        }),
      });
      
      return result.session || null;
    } catch (error) {
      console.error('Error initializing session:', error);
      return null;
    }
  }, [apiCall]);

  const createSession = useCallback(async (sessionId: string, documentName: string, userId?: string): Promise<ChatSession | null> => {
    try {
      const result = await apiCall('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          action: 'create',
          sessionId,
          documentName,
          userId
        }),
      });
      
      return result.session || null;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  }, [apiCall]);

  const deleteSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const result = await apiCall(`/api/chat?sessionId=${encodeURIComponent(sessionId)}`, {
        method: 'DELETE',
      });
      
      return result.success;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }, [apiCall]);

  const getAllSessions = useCallback(async (userId?: string): Promise<ChatSession[]> => {
    try {
      const url = userId ? `/api/chat?userId=${encodeURIComponent(userId)}` : '/api/chat';
      const result = await apiCall(url);
      
      return result.sessions || [];
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  }, [apiCall]);

  const generateResponse = useCallback(async (
    sessionId: string, 
    userMessage: string, 
    conversationHistory: Message[]
  ): Promise<{
    response: string;
    citations: string[];
    sources: DocumentSearchResult[];
  } | null> => {
    try {
      const result = await apiCall('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          action: 'generate_response',
          sessionId,
          userMessage,
          conversationHistory
        }),
      });
      
      return {
        response: result.response || '',
        citations: result.citations || [],
        sources: result.sources || []
      };
    } catch (error) {
      console.error('Error generating response:', error);
      return null;
    }
  }, [apiCall]);

  return {
    loading,
    error,
    saveMessage,
    restoreChat,
    initializeSession,
    createSession,
    deleteSession,
    getAllSessions,
    generateResponse,
  };
};