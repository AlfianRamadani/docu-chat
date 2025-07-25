import AzureStorage from './azure/storage';
import AzureSearch from './azure/search';
import azureOpenAIService from './azure/openai';
import chatService from './chat/chatService';
import { Message } from '../types/chat';

export interface DocumentProcessingResult {
  success: boolean;
  documentId: string;
  documentName: string;
  summary?: string;
  topics?: string[];
  error?: string;
}

export interface DocumentSearchResult {
  content: string;
  metadata: {
    fileName: string;
    sessionId: string;
    pageNumber?: number;
    section?: string;
  };
  score: number;
}

class DocumentProcessingService {
  private static instance: DocumentProcessingService;

  private constructor() {}

  public static getInstance(): DocumentProcessingService {
    if (!DocumentProcessingService.instance) {
      DocumentProcessingService.instance = new DocumentProcessingService();
    }
    return DocumentProcessingService.instance;
  }

  /**
   * Complete document processing pipeline
   */
  public async processDocument(
    file: File, 
    sessionId: string
  ): Promise<DocumentProcessingResult> {
    try {
      console.log(`Starting document processing for: ${file.name}`);
      
      // Step 1: Upload to Azure Blob Storage
      const { uploadBlob } = await AzureStorage();
      const uploadResult = await uploadBlob(file, sessionId);
      
      if (!uploadResult || uploadResult instanceof Error) {
        throw new Error('Failed to upload document to Azure Storage');
      }

      console.log('Document uploaded to Azure Storage');

      // Step 2: Trigger Azure Search indexing
      const { runIndexes } = await AzureSearch();
      await runIndexes();
      
      console.log('Azure Search indexing triggered');

      // Step 3: Wait for indexing to complete (simplified - in production, use webhooks)
      await this.waitForIndexing(sessionId, file.name);

      // Step 4: Extract document content for AI processing
      const documentContent = await this.extractDocumentContent(sessionId, file.name);

      // Step 5: Generate document summary and topics
      let summary: string | undefined;
      let topics: string[] | undefined;

      if (documentContent) {
        try {
          summary = await azureOpenAIService.summarizeDocument(documentContent, file.name);
          topics = await azureOpenAIService.extractTopics(documentContent);
        } catch (error) {
          console.warn('AI processing failed, continuing without summary:', error);
        }
      }

      // Step 6: Update chat session with document information
      await this.updateChatSessionWithDocument(sessionId, file.name, summary, topics);

      console.log('Document processing completed successfully');

      return {
        success: true,
        documentId: `${sessionId}-${file.name}`,
        documentName: file.name,
        summary,
        topics
      };

    } catch (error) {
      console.error('Document processing error:', error);
      return {
        success: false,
        documentId: '',
        documentName: file.name,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Search for relevant document content based on user query
   */
  public async searchDocumentContent(
    sessionId: string,
    query: string,
    topK: number = 5
  ): Promise<DocumentSearchResult[]> {
    try {
      const { getDocuments } = await AzureSearch();
      const searchResults = await getDocuments(sessionId);
      
      if (!searchResults) {
        return [];
      }

      const results: DocumentSearchResult[] = [];
      
      // Process search results
      for await (const result of searchResults.results) {
        if (result.document) {
          results.push({
            content: result.document.content || '',
            metadata: {
              fileName: result.document.metadata_storage_name || 'Unknown',
              sessionId: result.document.sessionId || sessionId,
              pageNumber: result.document.pageNumber,
              section: result.document.section
            },
            score: result.score || 0
          });
        }
      }

      // Sort by relevance score and return top K
      return results
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

    } catch (error) {
      console.error('Document search error:', error);
      return [];
    }
  }

  /**
   * Generate AI response with document context
   */
  public async generateContextualResponse(
    sessionId: string,
    userMessage: string,
    conversationHistory: Message[]
  ): Promise<{
    response: string;
    citations: string[];
    sources: DocumentSearchResult[];
  }> {
    try {
      // Step 1: Search for relevant document content
      const documentSources = await this.searchDocumentContent(sessionId, userMessage);
      
      // Step 2: Extract content for AI context
      const documentContext = documentSources.map(source => 
        `Source: ${source.metadata.fileName}\nContent: ${source.content}`
      );

      // Step 3: Convert conversation history to AI format
      const aiHistory = conversationHistory
        .filter(msg => msg.content.trim().length > 0)
        .map(msg => ({
          role: msg.isUser ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));

      // Step 4: Generate AI response with context
      const aiResponse = await azureOpenAIService.generateResponse(
        userMessage,
        documentContext,
        aiHistory
      );

      // Step 5: Generate citations
      const citations = documentSources.map(source => {
        const fileName = source.metadata.fileName;
        const pageRef = source.metadata.pageNumber ? ` (Page ${source.metadata.pageNumber})` : '';
        return `${fileName}${pageRef}`;
      });

      return {
        response: aiResponse,
        citations: [...new Set(citations)], // Remove duplicates
        sources: documentSources
      };

    } catch (error) {
      console.error('Contextual response generation error:', error);
      
      // Fallback response
      return {
        response: "I apologize, but I'm having trouble accessing the document content right now. Please try again or ask a different question.",
        citations: [],
        sources: []
      };
    }
  }

  /**
   * Get document summary for a session
   */
  public async getDocumentSummary(sessionId: string): Promise<string | null> {
    try {
      const session = await chatService.restoreChatSession(sessionId);
      
      if (session.success && session.session?.messages) {
        // Look for system messages containing document summary
        const summaryMessage = session.session.messages.find(
          msg => !msg.isUser && msg.content.includes('Document Summary:')
        );
        
        if (summaryMessage) {
          return summaryMessage.content;
        }
      }

      return null;
    } catch (error) {
      console.error('Error retrieving document summary:', error);
      return null;
    }
  }

  /**
   * Wait for Azure Search indexing to complete
   */
  private async waitForIndexing(sessionId: string, fileName: string): Promise<void> {
    const maxWaitTime = 30000; // 30 seconds
    const pollInterval = 2000; // 2 seconds
    let elapsed = 0;

    while (elapsed < maxWaitTime) {
      try {
        const results = await this.searchDocumentContent(sessionId, fileName, 1);
        if (results.length > 0) {
          console.log('Document indexing completed');
          return;
        }
      } catch {
        // Continue waiting
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
      elapsed += pollInterval;
    }

    console.warn('Document indexing may not be complete, continuing...');
  }

  /**
   * Extract document content from search index
   */
  private async extractDocumentContent(sessionId: string, fileName: string): Promise<string | null> {
    try {
      const results = await this.searchDocumentContent(sessionId, fileName, 10);
      
      if (results.length === 0) {
        return null;
      }

      // Combine all content chunks
      return results.map(result => result.content).join('\n\n');
    } catch (error) {
      console.error('Error extracting document content:', error);
      return null;
    }
  }

  /**
   * Update chat session with document processing results
   */
  private async updateChatSessionWithDocument(
    sessionId: string,
    documentName: string,
    summary?: string,
    topics?: string[]
  ): Promise<void> {
    try {
      if (summary) {
        const summaryMessage: Message = {
          id: `summary-${Date.now()}`,
          content: `Document Summary: ${documentName}\n\n${summary}`,
          isUser: false,
          timestamp: new Date()
        };

        await chatService.saveMessage({ sessionId, message: summaryMessage });
      }

      if (topics && topics.length > 0) {
        const topicsMessage: Message = {
          id: `topics-${Date.now()}`,
          content: `Key Topics in ${documentName}: ${topics.join(', ')}`,
          isUser: false,
          timestamp: new Date()
        };

        await chatService.saveMessage({ sessionId, message: topicsMessage });
      }
    } catch (error) {
      console.error('Error updating chat session with document info:', error);
    }
  }
}

export const documentProcessingService = DocumentProcessingService.getInstance();
export default documentProcessingService;