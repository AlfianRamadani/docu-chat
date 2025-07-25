#!/usr/bin/env node

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function testMongoDBConnection() {
  console.log('🔍 MongoDB Connection Diagnostics');
  console.log('================================\n');

  // Check environment variables
  console.log('1. Environment Variables Check:');
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is not set');
    console.log('Please add MONGODB_URI to your .env file');
    return;
  }
  
  console.log('✅ MONGODB_URI is set');
  
  // Mask sensitive parts of the URI for logging
  const maskedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log(`   URI: ${maskedUri}\n`);

  // Test basic connection
  console.log('2. Basic Connection Test:');
  const client = new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: 10000, // 10 second timeout
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
    retryWrites: true,
    w: 'majority'
  });

  try {
    console.log('   Attempting to connect...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');

    // Test database operations
    console.log('\n3. Database Operations Test:');
    const db = client.db('docu-chat');
    
    // Ping test
    console.log('   Testing ping...');
    await db.command({ ping: 1 });
    console.log('✅ Ping successful');

    // List collections
    console.log('   Listing collections...');
    const collections = await db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections:`, collections.map(c => c.name));

    // Test chat collection operations
    console.log('\n4. Chat Collection Test:');
    const chatCollection = db.collection('chats');
    
    // Insert test document
    console.log('   Inserting test chat...');
    const testChat = {
      sessionId: 'test-' + Date.now(),
      title: 'Test Chat',
      messages: [
        {
          id: 'msg-1',
          content: 'Test message',
          role: 'user',
          timestamp: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const insertResult = await chatCollection.insertOne(testChat);
    console.log('✅ Test chat inserted with ID:', insertResult.insertedId);

    // Read test document
    console.log('   Reading test chat...');
    const foundChat = await chatCollection.findOne({ _id: insertResult.insertedId });
    console.log('✅ Test chat retrieved successfully');

    // Update test document
    console.log('   Updating test chat...');
    await chatCollection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { title: 'Updated Test Chat', updatedAt: new Date() } }
    );
    console.log('✅ Test chat updated successfully');

    // Delete test document
    console.log('   Cleaning up test chat...');
    await chatCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Test chat deleted successfully');

    console.log('\n🎉 All MongoDB tests passed successfully!');
    console.log('Your MongoDB integration is working correctly.');

  } catch (error) {
    console.error('\n❌ MongoDB connection failed:', error.message);
    
    // Provide specific troubleshooting guidance
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔧 Troubleshooting: DNS Resolution Error');
      console.log('- Check your internet connection');
      console.log('- Verify the MongoDB cluster hostname is correct');
      console.log('- Try connecting from a different network');
    } else if (error.message.includes('authentication failed')) {
      console.log('\n🔧 Troubleshooting: Authentication Error');
      console.log('- Verify your username and password are correct');
      console.log('- Check if the user has proper permissions');
      console.log('- Ensure the database name in the URI is correct');
    } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.log('\n🔧 Troubleshooting: SSL/TLS Error');
      console.log('- Ensure your MongoDB Atlas cluster allows connections from your IP');
      console.log('- Check if your network blocks SSL connections');
      console.log('- Try adding &ssl=true to your connection string');
    } else if (error.message.includes('timeout')) {
      console.log('\n🔧 Troubleshooting: Connection Timeout');
      console.log('- Check your firewall settings');
      console.log('- Verify MongoDB Atlas IP whitelist includes your IP');
      console.log('- Try increasing the timeout values');
    }
    
    console.log('\n📋 Connection String Format:');
    console.log('mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority');
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

// Run the test
testMongoDBConnection().catch(console.error);