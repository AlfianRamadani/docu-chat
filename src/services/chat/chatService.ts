import mongodb from '../db/mongodb';
import { ChatSession, Message, CreateChatSessionRequest, SaveMessageRequest, RestoreChatResponse } from '../../types/chat';
import { Collection } from 'mongodb';

class ChatService {
  private static instance: ChatService;
  private readonly COLLECTION_NAME = 'chat_sessions';

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  private async getCollection(): Promise<Collection<ChatSession>> {
    await mongodb.ensureConnection();
    return mongodb.getCollection<ChatSession>(this.COLLECTION_NAME);
  }

  /**
   * Create a new chat session
   */
  public async createChatSession(request: CreateChatSessionRequest): Promise<ChatSession> {
    try {
      const collection = await this.getCollection();
      
      const newSession: ChatSession = {
        sessionId: request.sessionId,
        documentName: request.documentName,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: request.userId
      };

      const result = await collection.insertOne(newSession);
      
      return {
        ...newSession,
        _id: result.insertedId.toString()
      };
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw new Error('Failed to create chat session');
    }
  }

  /**
   * Save a message to an existing chat session
   */
  public async saveMessage(request: SaveMessageRequest): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      
      const result = await collection.updateOne(
        { sessionId: request.sessionId },
        {
          $push: { messages: request.message },
          $set: { updatedAt: new Date() }
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error saving message:', error);
      throw new Error('Failed to save message');
    }
  }

  /**
   * Restore chat session by sessionId
   */
  public async restoreChatSession(sessionId: string): Promise<RestoreChatResponse> {
    try {
      const collection = await this.getCollection();
      
      const session = await collection.findOne({ sessionId });
      console.log(session);
      
      if (!session) {
        return {
          success: false,
          error: 'Chat session not found'
        };
      }

      return {
        success: true,
        session
      };
    } catch (error) {
      console.error('Error restoring chat session:', error);
      return {
        success: false,
        error: 'Failed to restore chat session'
      };
    }
  }

  /**
   * Get all chat sessions for a user (optional userId filter)
   */
  public async getChatSessions(userId?: string): Promise<ChatSession[]> {
    try {
      const collection = await this.getCollection();
      
      const filter = userId ? { userId } : {};
      const sessions = await collection
        .find(filter)
        .sort({ updatedAt: -1 })
        .toArray();

      return sessions;
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      throw new Error('Failed to get chat sessions');
    }
  }

  /**
   * Update chat session metadata
   */
  public async updateChatSession(sessionId: string, updates: Partial<ChatSession>): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      
      const result = await collection.updateOne(
        { sessionId },
        {
          $set: {
            ...updates,
            updatedAt: new Date()
          }
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating chat session:', error);
      throw new Error('Failed to update chat session');
    }
  }

  /**
   * Delete a chat session
   */
  public async deleteChatSession(sessionId: string): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      
      const result = await collection.deleteOne({ sessionId });
      
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting chat session:', error);
      throw new Error('Failed to delete chat session');
    }
  }

  /**
   * Check if a chat session exists
   */
  public async sessionExists(sessionId: string): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      
      const count = await collection.countDocuments({ sessionId });
      
      return count > 0;
    } catch (error) {
      console.error('Error checking session existence:', error);
      return false;
    }
  }

  /**
   * Initialize a chat session with a welcome message
   */
  public async initializeChatSession(sessionId: string, documentName: string): Promise<ChatSession> {
    try {
      // Check if session already exists
      const existingSession = await this.restoreChatSession(sessionId);
      
      if (existingSession.success && existingSession.session) {
        return existingSession.session;
      }

      // Create new session with welcome message
      const welcomeMessage: Message = {
        id: `service-welcome-${Date.now()}`,
        content: `Hello! I've analyzed "${documentName}" and I'm ready to help you understand its content. You can ask me questions, request summaries, or explore specific topics within the document.`,
        isUser: false,
        timestamp: new Date()
      };

      const newSession = await this.createChatSession({
        sessionId,
        documentName
      });

      // Add welcome message
      await this.saveMessage({
        sessionId,
        message: welcomeMessage
      });

      // Return session with welcome message
      return {
        ...newSession,
        messages: [welcomeMessage]
      };
    } catch (error) {
      console.error('Error initializing chat session:', error);
      throw new Error('Failed to initialize chat session');
    }
  }
}

// Export singleton instance
export const chatService = ChatService.getInstance();
export default chatService;