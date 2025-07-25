import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, File, MoreHorizontal, RefreshCw, Bot, User } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { Message } from "@/types/chat";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface ChatInterfaceProps {
  documentName: string;
  onBack?: () => void;
  sessionId?: string;
}

const ChatInterface = ({ documentName, sessionId }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { 
    saveMessage, 
    restoreChat, 
    initializeSession,
    generateResponse
  } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to ensure unique message IDs
  const ensureUniqueMessageIds = (messages: Message[]): Message[] => {
    const seenIds = new Set<string>();
    return messages.map(message => {
      if (seenIds.has(message.id)) {
        // Generate a new unique ID for duplicate messages
        const newId = `restored-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        seenIds.add(newId);
        return { ...message, id: newId };
      } else {
        seenIds.add(message.id);
        return message;
      }
    });
  };

  // Initialize or restore chat session on component mount
  useEffect(() => {
    const initializeChat = async () => {
      if (!sessionId) return;
      
      setIsRestoring(true);
      try {
        // Try to restore existing session first
        const restoredSession = await restoreChat(sessionId);
        
        if (restoredSession && restoredSession.messages.length > 0) {
          setMessages(ensureUniqueMessageIds(restoredSession.messages));
        } else {
          // Initialize new session if no existing session found
          const newSession = await initializeSession(sessionId, documentName);
          if (newSession && newSession.messages.length > 0) {
            setMessages(ensureUniqueMessageIds(newSession.messages));
          } else {
            // Fallback to default welcome message
            const welcomeMessage: Message = {
              id: `welcome-${Date.now()}`,
              content: `Hello! I've analyzed "${documentName}" and I'm ready to help you understand its content. You can ask me questions, request summaries, or explore specific topics within the document.`,
              isUser: false,
              timestamp: new Date()
            };
            setMessages([welcomeMessage]);
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        // Fallback to default welcome message
        const welcomeMessage: Message = {
          id: `welcome-fallback-${Date.now()}`,
          content: `Hello! I've analyzed "${documentName}" and I'm ready to help you understand its content. You can ask me questions, request summaries, or explore specific topics within the document.`,
          isUser: false,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      } finally {
        setIsRestoring(false);
      }
    };

    initializeChat();
  }, [sessionId, documentName, restoreChat, initializeSession]);

  // Function to manually restore chat
  const handleRestoreChat = async () => {
    if (!sessionId) return;
    
    setIsRestoring(true);
    try {
      const restoredSession = await restoreChat(sessionId);
      if (restoredSession && restoredSession.messages.length > 0) {
        setMessages(ensureUniqueMessageIds(restoredSession.messages));
      }
    } catch (error) {
      console.error('Error restoring chat:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  const generateAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    try {
      if (!sessionId) {
        throw new Error('No session ID available');
      }

      // Get conversation history for context
      const conversationHistory = messages.slice(-10); // Last 10 messages for context
      
      // Generate intelligent response using document context
      const result = await generateResponse(sessionId, userMessage, conversationHistory);
      
      if (!result) {
        throw new Error('Failed to generate response');
      }

      const newMessage: Message = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: result.response,
        isUser: false,
        timestamp: new Date(),
        citations: result.citations
      };

      setMessages(prev => [...prev, newMessage]);

      // Save AI message to database
      if (sessionId) {
        try {
          await saveMessage(sessionId, newMessage);
        } catch (error) {
          console.error('Error saving AI message:', error);
        }
      }

    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback to simple response
      const fallbackMessage: Message = {
        id: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: "I apologize, but I'm having trouble accessing the document content right now. Please try again or ask a different question.",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, fallbackMessage]);

      if (sessionId) {
        try {
          await saveMessage(sessionId, fallbackMessage);
        } catch (error) {
          console.error('Error saving fallback message:', error);
        }
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    
    // Auto-resize textarea back to original size
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Save user message to database
    try {
      await saveMessage(sessionId, userMessage);
    } catch (error) {
      console.error('Error saving user message:', error);
    }

    await generateAIResponse(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left sidebar */}
      <Card className="w-80 flex-shrink-0 rounded-none border-r border-l-0 border-t-0 border-b-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
       
            <h2 className="font-semibold text-lg truncate">Chats</h2>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="space-y-2">
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <File className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm truncate">{documentName}</span>
                </div>
                <p className="text-xs text-muted-foreground">Active chat</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </Card>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <File className="w-5 h-5 text-primary" />
              <div>
                <h1 className="font-semibold">{documentName}</h1>
                <p className="text-sm text-muted-foreground">
                  {isRestoring ? 'Restoring chat...' : 'Ready to chat'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRestoreChat}
                disabled={isRestoring || !sessionId}
                title="Restore chat from database"
              >
                <RefreshCw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!message.isUser && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.isUser
                      ? 'bg-chat-user text-chat-user-foreground'
                      : 'bg-chat-ai text-chat-ai-foreground'
                  }`}
                >
                  {message.isUser ? (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  ) : (
                    <MarkdownRenderer content={message.content} />
                  )}
                  {message.citations && (
                    <div className="mt-3 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Sources:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.citations.map((citation, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 bg-muted/50 text-xs rounded"
                          >
                            {citation}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                {message.isUser && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-4 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-chat-ai text-chat-ai-foreground max-w-[70%] rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">AI is typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    handleTextareaResize();
                  }}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask a question about your document..."
                  className="resize-none min-h-[60px] max-h-[200px] pr-12 border-border/50 focus:border-primary/50"
                  rows={1}
                />
              </div>
              <Button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                size="lg"
                className="h-[60px] w-[60px] rounded-full"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;