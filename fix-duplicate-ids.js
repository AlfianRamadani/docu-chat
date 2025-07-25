const { MongoClient } = require('mongodb');

/**
 * Utility script to fix duplicate message IDs in existing database records
 * Run this once to clean up any existing messages with duplicate IDs
 */
async function fixDuplicateMessageIds() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in environment variables');
    return;
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('docu-chat');
    const collection = db.collection('chat-sessions');
    
    // Find all sessions
    const sessions = await collection.find({}).toArray();
    
    let updatedCount = 0;
    
    for (const session of sessions) {
      if (session.messages && session.messages.length > 0) {
        const seenIds = new Set();
        let hasChanges = false;
        
        const updatedMessages = session.messages.map((message) => {
          if (seenIds.has(message.id)) {
            // Generate a new unique ID for duplicate messages
            const newId = `migrated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            seenIds.add(newId);
            hasChanges = true;
            console.log(`Fixed duplicate ID "${message.id}" -> "${newId}" in session ${session.sessionId}`);
            return { ...message, id: newId };
          } else {
            seenIds.add(message.id);
            return message;
          }
        });
        
        if (hasChanges) {
          await collection.updateOne(
            { _id: session._id },
            { $set: { messages: updatedMessages } }
          );
          updatedCount++;
        }
      }
    }
    
    console.log(`Migration completed. Updated ${updatedCount} sessions.`);
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await client.close();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  fixDuplicateMessageIds()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}