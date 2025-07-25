import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

interface AzureStorageConfig {
  connectionString: string;
  containerName: string;
}

interface UploadResult {
  success: boolean;
  blobName?: string;
  url?: string;
  error?: string;
}

class AzureStorageService {
  private static instance: AzureStorageService;
  private config: AzureStorageConfig;
  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;

  private constructor() {
    this.config = {
      connectionString: process.env.NEXT_PUBLIC_AZURE_STORAGE_BLOB_CONNECTION_STRING || '',
      containerName: process.env.NEXT_PUBLIC_AZURE_STORAGE_BLOB_CONTAINER_NAME || ''
    };

    if (!this.config.connectionString || !this.config.containerName) {
      throw new Error('Storage configuration is missing. Please check environment variables.');
    }

    this.blobServiceClient = BlobServiceClient.fromConnectionString(this.config.connectionString);
    this.containerClient = this.blobServiceClient.getContainerClient(this.config.containerName);
  }

  public static getInstance(): AzureStorageService {
    if (!AzureStorageService.instance) {
      AzureStorageService.instance = new AzureStorageService();
    }
    return AzureStorageService.instance;
  }

  /**
   * Test service connectivity
   */
  public async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.blobServiceClient.getAccountInfo();
      return { success: true };
    } catch (error) {
      console.error('Storage connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown connection error' 
      };
    }
  }

  /**
   * Ensure container exists
   */
  public async ensureContainer(): Promise<{ success: boolean; error?: string }> {
    try {
      const exists = await this.containerClient.exists();
      if (!exists) {
        console.log(`Creating container: ${this.config.containerName}`);
        await this.containerClient.create({
          access: 'blob' // Allow public read access to blobs
        });
      }
      return { success: true };
    } catch (error) {
      console.error('Error ensuring container exists:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create container' 
      };
    }
  }

  /**
   * Upload file to blob storage
   */
  public async uploadBlob(file: File, sessionId: string): Promise<UploadResult> {
    try {
      // Ensure container exists
      const containerResult = await this.ensureContainer();
      if (!containerResult.success) {
        return { success: false, error: containerResult.error };
      }

      // Generate unique blob name
      const timestamp = new Date().getTime();
      const blobName = `${sessionId}/${file.name}_${timestamp}`;
      
      console.log(`Uploading blob: ${blobName}`);
      
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      
      // Convert file to array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Upload with metadata
      await blockBlobClient.upload(arrayBuffer, file.size, {
        metadata: {
          sessionId: sessionId,
          originalName: file.name,
          uploadTime: new Date().toISOString(),
          fileSize: file.size.toString()
        },
        blobHTTPHeaders: {
          blobContentType: file.type || 'application/octet-stream'
        }
      });

      console.log(`Blob uploaded successfully: ${blobName}`);
      
      return {
        success: true,
        blobName,
        url: blockBlobClient.url
      };
    } catch (error) {
      console.error('Error uploading blob:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to upload blob' 
      };
    }
  }

  /**
   * List blobs by session ID
   */
  public async listBlobsBySession(sessionId: string): Promise<unknown[]> {
    try {
      const blobs = [];
      
      for await (const blob of this.containerClient.listBlobsFlat({
        prefix: `${sessionId}/`
      })) {
        blobs.push(blob);
      }
      
      return blobs;
    } catch (error) {
      console.error('Error listing blobs by session:', error);
      throw error;
    }
  }

  /**
   * Get blob metadata
   */
  public async getBlobMetadata(blobName: string): Promise<unknown> {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      const properties = await blockBlobClient.getProperties();
      return properties.metadata;
    } catch (error) {
      console.error('Error getting blob metadata:', error);
      throw error;
    }
  }

  /**
   * Delete blob
   */
  public async deleteBlob(blobName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.delete();
      return { success: true };
    } catch (error) {
      console.error('Error deleting blob:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete blob' 
      };
    }
  }

  /**
   * Get container statistics
   */
  public async getContainerStats(): Promise<unknown> {
    try {
      let blobCount = 0;
      let totalSize = 0;
      
      for await (const blob of this.containerClient.listBlobsFlat()) {
        blobCount++;
        totalSize += blob.properties.contentLength || 0;
      }
      
      return { blobCount, totalSize };
    } catch (error) {
      console.error('Error getting container stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const azureStorageService = AzureStorageService.getInstance();

// Legacy function for backward compatibility
export async function AzureStorage() {
  return {
    uploadBlob: (file: File, sessionId: string) => azureStorageService.uploadBlob(file, sessionId)
  };
}

export default azureStorageService;
