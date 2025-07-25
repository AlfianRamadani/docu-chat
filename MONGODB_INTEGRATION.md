# MongoDB Chat Integration

This document describes the MongoDB integration for storing and restoring chat sessions with the AI assistant.

## Features

- **Persistent Chat Storage**: All chat messages are automatically saved to MongoDB
- **Chat Session Restoration**: Users can restore their previous chat sessions
- **Automatic Initialization**: New chat sessions are automatically created with welcome messages
- **Real-time Saving**: Messages are saved in real-time as they are sent/received

## Architecture

### Database Structure

The application uses MongoDB with the following collection:

#### `chat_sessions` Collection

```typescript
interface ChatSession {
  _id?: string;
  sessionId: string;        // Unique session identifier
  documentName: string;     // Name of the document being discussed
  messages: Message[];      // Array of chat messages
  createdAt: Date;         // Session creation timestamp
  updatedAt: Date;         // Last update timestamp
  userId?: string;         // Optional user identifier for future authentication
}
```

#### Message Structure

```typescript
interface Message {
  id: string;              // Unique message identifier
  content: string;         // Message content
  isUser: boolean;         // Whether message is from user or AI
  timestamp: Date;         // Message timestamp
  citations?: string[];    // Optional citations for AI responses
  translatedContent?: string;    // Optional translated content
  showTranslation?: boolean;     // Translation display state
}
```

### Services

#### MongoDB Service (`src/services/db/mongodb.ts`)
- Singleton pattern for database connection management
- Automatic connection handling with error recovery
- Collection access methods

#### Chat Service (`src/services/chat/chatService.ts`)
- High-level chat operations (create, save, restore, delete)
- Session management and initialization
- Message persistence

### API Endpoints

#### `/api/chat` (POST)
Handles various chat operations based on the `action` parameter:

- `create`: Create a new chat session
- `save_message`: Save a message to existing session
- `restore`: Restore a chat session by sessionId
- `initialize`: Initialize a new session with welcome message

#### `/api/chat` (GET)
- Get specific session: `?sessionId=<id>`
- Get all sessions: `?userId=<id>` (optional)

#### `/api/chat` (DELETE)
- Delete session: `?sessionId=<id>`

### React Hooks

#### `useChat` Hook (`src/hooks/useChat.ts`)
Provides React components with chat functionality:

```typescript
const {
  loading,           // Loading state
  error,            // Error state
  saveMessage,      // Save message function
  restoreChat,      // Restore chat function
  initializeSession, // Initialize new session
  createSession,    // Create session
  deleteSession,    // Delete session
  getAllSessions    // Get all sessions
} = useChat();
```

## Usage

### Component Integration

Both `ChatInterface` and `MobileChatInterface` components support MongoDB integration:

```tsx
<ChatInterface 
  documentName="document.pdf" 
  sessionId="unique-session-id"
  onBack={() => {}} 
/>
```

### Automatic Features

1. **Session Initialization**: When a component mounts, it automatically:
   - Tries to restore existing session
   - Creates new session if none exists
   - Adds welcome message for new sessions

2. **Message Persistence**: Every message (user and AI) is automatically saved to MongoDB

3. **Manual Restoration**: Users can manually restore chat using the refresh button in the header

### Error Handling

The system includes comprehensive error handling:
- Fallback to local state if database operations fail
- Graceful degradation when MongoDB is unavailable
- User-friendly error messages and loading states

## Environment Setup

Ensure your MongoDB connection string is properly configured in:
`src/services/db/mongodb.ts`

```typescript
const uri = 'your-mongodb-connection-string';
```

## Dependencies

The integration uses the following key dependencies:
- `mongodb`: Official MongoDB Node.js driver
- `@types/mongodb`: TypeScript definitions

## Security Considerations

1. **Connection String**: Store MongoDB connection string securely (environment variables recommended)
2. **Input Validation**: All user inputs are validated before database operations
3. **Error Handling**: Database errors don't expose sensitive information to users

## Future Enhancements

1. **User Authentication**: Add userId support for multi-user environments
2. **Chat History UI**: Create a dedicated interface for browsing chat history
3. **Search Functionality**: Add search capabilities across chat sessions
4. **Export Features**: Allow users to export their chat history
5. **Real-time Updates**: Implement WebSocket support for real-time collaboration