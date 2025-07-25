import { NextResponse } from 'next/server';
import mongodb from '@/services/db/mongodb';

export async function GET() {
  const healthChecks = {
    mongodb: { status: 'unknown', message: '', timestamp: new Date().toISOString() },
    azure_storage: { status: 'unknown', message: '', timestamp: new Date().toISOString() },
    azure_search: { status: 'unknown', message: '', timestamp: new Date().toISOString() },
    azure_openai: { status: 'unknown', message: '', timestamp: new Date().toISOString() }
  };

  // Test MongoDB
  try {
    await mongodb.connect();
    const db = mongodb.getDatabase();
    await db.command({ ping: 1 });

    healthChecks.mongodb = {
      status: 'healthy',
      message: 'MongoDB connection successful',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    healthChecks.mongodb = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'MongoDB connection failed',
      timestamp: new Date().toISOString()
    };
  }

  // Test Azure Storage
  try {
    const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const storageAccountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

    if (!storageAccountName || !storageAccountKey) {
      throw new Error('Azure Storage credentials not configured');
    }

    // Basic configuration check
    healthChecks.azure_storage = {
      status: 'configured',
      message: 'Azure Storage credentials are configured',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    healthChecks.azure_storage = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Azure Storage configuration failed',
      timestamp: new Date().toISOString()
    };
  }

  // Test Azure Search
  try {
    const searchEndpoint = process.env.AZURE_SEARCH_ENDPOINT;
    const searchApiKey = process.env.AZURE_SEARCH_API_KEY;

    if (!searchEndpoint || !searchApiKey) {
      throw new Error('Azure Search credentials not configured');
    }

    healthChecks.azure_search = {
      status: 'configured',
      message: 'Azure Search credentials are configured',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    healthChecks.azure_search = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Azure Search configuration failed',
      timestamp: new Date().toISOString()
    };
  }

  // Test Azure OpenAI
  try {
    const openaiEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const openaiApiKey = process.env.AZURE_OPENAI_API_KEY;

    if (!openaiEndpoint || !openaiApiKey) {
      throw new Error('Azure OpenAI credentials not configured');
    }

    healthChecks.azure_openai = {
      status: 'configured',
      message: 'Azure OpenAI credentials are configured',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    healthChecks.azure_openai = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Azure OpenAI configuration failed',
      timestamp: new Date().toISOString()
    };
  }

  // Determine overall health
  const allHealthy = Object.values(healthChecks).every(check => check.status === 'healthy' || check.status === 'configured');

  const overallStatus = allHealthy ? 'healthy' : 'degraded';

  return NextResponse.json(
    {
      overall_status: overallStatus,
      services: healthChecks,
      timestamp: new Date().toISOString()
    },
    {
      status: allHealthy ? 200 : 503
    }
  );
}
