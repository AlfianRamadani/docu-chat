import { NextResponse } from 'next/server';
import mongodb from '@/services/db/mongodb';

export async function GET() {
  try {
    // Test connection
    await mongodb.connect();
    
    // Test database operation
    const db = mongodb.getDatabase();
    await db.command({ ping: 1 });
    
    // Get basic stats
    const stats = await db.stats();
    
    return NextResponse.json({
      status: 'healthy',
      message: 'MongoDB connection is working',
      database: 'docu-chat',
      collections: stats.collections || 0,
      dataSize: stats.dataSize || 0,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('MongoDB health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      message: 'MongoDB connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}