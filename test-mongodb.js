// Test script to verify MongoDB integration
import mongodb from '../src/services/db/mongodb';
import chatService from '../src/services/chat/chatService';

async function testMongoDBIntegration() {
  console.log('Testing MongoDB Integration...');
  
  try {
    // Test database connection
    console.log('1. Testing database connection...');
    await mongodb.connect();
    console.log('✅ Database connected successfully');
    
    // Test session creation
    console.log('2. Testing session creation...');
    const testSessionId = `test-session-${Date.now()}`;
    const session = await chatService.createChatSession({
      sessionId: testSessionId,
      documentName: 'test-document.pdf'
    });
    console.log('✅ Session created:', session.sessionId);
    
    // Test message saving
    console.log('3. Testing message saving...');
    const testMessage = {
      id: '1',
      content: 'Hello, this is a test message',
      isUser: true,
      timestamp: new Date()
    };
    
    const saved = await chatService.saveMessage({
      sessionId: testSessionId,
      message: testMessage
    });
    console.log('✅ Message saved:', saved);
    
    // Test session restoration
    console.log('4. Testing session restoration...');
    const restored = await chatService.restoreChatSession(testSessionId);
    console.log('✅ Session restored:', restored.success);
    console.log('   Messages count:', restored.session?.messages.length);
    
    // Test session initialization
    console.log('5. Testing session initialization...');
    const newSessionId = `test-init-${Date.now()}`;
    const initialized = await chatService.initializeChatSession(newSessionId, 'init-test.pdf');
    console.log('✅ Session initialized with welcome message');
    console.log('   Messages count:', initialized.messages.length);
    
    // Cleanup test sessions
    console.log('6. Cleaning up test sessions...');
    await chatService.deleteChatSession(testSessionId);
    await chatService.deleteChatSession(newSessionId);
    console.log('✅ Test sessions cleaned up');
    
    console.log('\n🎉 All MongoDB integration tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongodb.disconnect();
    console.log('Database disconnected');
  }
}

// Run the test
testMongoDBIntegration().catch(console.error);