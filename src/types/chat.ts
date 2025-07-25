export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  citations?: string[];
  translatedContent?: string;
  showTranslation?: boolean;
}

export interface ChatSession {
  _id?: string;
  sessionId: string;
  documentName: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string; // Optional for future user authentication
}

export interface CreateChatSessionRequest {
  sessionId: string;
  documentName: string;
  userId?: string;
}

export interface SaveMessageRequest {
  sessionId: string;
  message: Message;
}

export interface RestoreChatResponse {
  success: boolean;
  session?: ChatSession;
  error?: string;
}