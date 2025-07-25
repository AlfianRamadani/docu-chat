import { AzureKeyCredential, SearchClient, SearchIndexerClient, SearchIndexClient } from '@azure/search-documents';

interface AzureSearchConfig {
  apiKey: string;
  endpoint: string;
  indexName: string;
}

interface SearchDocument {
  id: string;
  content: string;
  metadata_storage_name: string;
  metadata_storage_path: string;
  sessionId: string;
  pageNumber?: number;
  section?: string;
  [key: string]: unknown;
}

interface SearchResult {
  document: SearchDocument;
  score: number;
}

class AzureSearchService {
  private static instance: AzureSearchService;
  private config: AzureSearchConfig;
  private searchClient: SearchClient<SearchDocument>;
  private indexerClient: SearchIndexerClient;
  private indexClient: SearchIndexClient;

  private constructor() {
    this.config = {
      apiKey: process.env.AZURE_SEARCH_API_KEY || '',
      endpoint: process.env.AZURE_SEARCH_ENDPOINT || '',
      indexName: process.env.AZURE_SEARCH_INDEX_NAME || 'azureblob-index'
    };

    if (!this.config.apiKey || !this.config.endpoint) {
      throw new Error('Azure Search configuration is missing. Please check environment variables.');
    }

    const credential = new AzureKeyCredential(this.config.apiKey);
    
    this.searchClient = new SearchClient<SearchDocument>(
      this.config.endpoint, 
      this.config.indexName, 
      credential
    );
    
    this.indexerClient = new SearchIndexerClient(this.config.endpoint, credential);
    this.indexClient = new SearchIndexClient(this.config.endpoint, credential);
  }

  public static getInstance(): AzureSearchService {
    if (!AzureSearchService.instance) {
      AzureSearchService.instance = new AzureSearchService();
    }
    return AzureSearchService.instance;
  }

  /**
   * Test service connectivity
   */
  public async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Test by getting service statistics
      await this.searchClient.getDocumentsCount();
      return { success: true };
    } catch (error) {
      console.error('Azure Search connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown connection error' 
      };
    }
  }

  /**
   * Run indexer to process new documents
   */
  public async runIndexer(indexerName?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const targetIndexer = indexerName || this.config.indexName.replace('-index', '-indexer');
      
      console.log(`Running indexer: ${targetIndexer}`);
      await this.indexerClient.runIndexer(targetIndexer);
      
      return { success: true };
    } catch (error) {
      console.error('Error running indexer:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to run indexer' 
      };
    }
  }

  /**
   * Get indexer status
   */
  public async getIndexerStatus(indexerName?: string): Promise<unknown> {
    try {
      const targetIndexer = indexerName || this.config.indexName.replace('-index', '-indexer');
      const status = await this.indexerClient.getIndexerStatus(targetIndexer);
      return status;
    } catch (error) {
      console.error('Error getting indexer status:', error);
      throw error;
    }
  }

  /**
   * Search documents by session ID
   */
  public async getDocumentsBySession(sessionId: string): Promise<SearchResult[]> {
    try {
      console.log(`Searching documents for session: ${sessionId}`);
      
      const searchResults = await this.searchClient.search('*', {
        filter: `sessionId eq '${sessionId}'`,
        top: 50,
        includeTotalCount: true
      });

      const results: SearchResult[] = [];
      
      for await (const result of searchResults.results) {
        results.push({
          document: result.document,
          score: result.score || 0
        });
      }

      console.log(`Found ${results.length} documents for session ${sessionId}`);
      return results;
    } catch (error) {
      console.error('Error searching documents by session:', error);
      throw error;
    }
  }

  /**
   * Search documents with query
   */
  public async searchDocuments(
    query: string, 
    sessionId?: string, 
    options: {
      top?: number;
      skip?: number;
      orderBy?: string[];
    } = {}
  ): Promise<SearchResult[]> {
    try {
      const { top = 10, skip = 0, orderBy } = options;
      
      let filter = '';
      if (sessionId) {
        filter = `sessionId eq '${sessionId}'`;
      }

      console.log(`Searching documents with query: "${query}", session: ${sessionId}`);

      const searchResults = await this.searchClient.search(query, {
        filter: filter || undefined,
        top,
        skip,
        orderBy,
        includeTotalCount: true,
        searchMode: 'any',
        queryType: 'simple'
      });

      const results: SearchResult[] = [];
      
      for await (const result of searchResults.results) {
        results.push({
          document: result.document,
          score: result.score || 0
        });
      }

      console.log(`Search returned ${results.length} results`);
      return results;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  public async getDocumentById(documentId: string): Promise<SearchDocument | null> {
    try {
      const result = await this.searchClient.getDocument(documentId);
      return result;
    } catch (error) {
      console.error('Error getting document by ID:', error);
      return null;
    }
  }

  /**
   * Get search service statistics
   */
  public async getServiceStats(): Promise<unknown> {
    try {
      const stats = await this.searchClient.getDocumentsCount();
      return { documentCount: stats };
    } catch (error) {
      console.error('Error getting service stats:', error);
      throw error;
    }
  }

  /**
   * List all indexers
   */
  public async listIndexers(): Promise<unknown[]> {
    try {
      const indexers = await this.indexerClient.listIndexers();
      return indexers;
    } catch (error) {
      console.error('Error listing indexers:', error);
      throw error;
    }
  }

  /**
   * Wait for indexer to complete
   */
  public async waitForIndexerCompletion(
    indexerName?: string, 
    maxWaitTimeMs: number = 60000
  ): Promise<{ success: boolean; status?: unknown; error?: string }> {
    const targetIndexer = indexerName || this.config.indexName.replace('-index', '-indexer');
    const startTime = Date.now();
    const pollInterval = 2000; // 2 seconds

    try {
      while (Date.now() - startTime < maxWaitTimeMs) {
        const status = await this.getIndexerStatus(targetIndexer);
        
        if (status && typeof status === 'object' && 'lastResult' in status && status.lastResult) {
          const lastResult = status.lastResult as { status: string; [key: string]: unknown };
          
          if (lastResult.status === 'success') {
            return { success: true, status };
          } else if (lastResult.status === 'transientFailure' || lastResult.status === 'error') {
            return { 
              success: false, 
              status, 
              error: `Indexer failed with status: ${lastResult.status}` 
            };
          }
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }

      return { 
        success: false, 
        error: `Indexer did not complete within ${maxWaitTimeMs}ms` 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error waiting for indexer' 
      };
    }
  }
}

// Export singleton instance
export const azureSearchService = AzureSearchService.getInstance();
export default azureSearchService;

// Legacy function for backward compatibility
export async function AzureSearch() {
  return {
    runIndexes: () => azureSearchService.runIndexer(),
    getDocuments: (sessionId: string) => azureSearchService.getDocumentsBySession(sessionId)
  };
}