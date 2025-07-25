import OpenAI from 'openai';

class AzureOpenAIService {
  private static instance: AzureOpenAIService;
  private openai: OpenAI;

  private constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
      defaultQuery: { 'api-version': '2024-02-15-preview' },
      defaultHeaders: {
        'api-key': process.env.AZURE_OPENAI_API_KEY,
      },
    });
  }

  public static getInstance(): AzureOpenAIService {
    if (!AzureOpenAIService.instance) {
      AzureOpenAIService.instance = new AzureOpenAIService();
    }
    return AzureOpenAIService.instance;
  }

  /**
   * Generate AI response based on user message and document context
   */
  public async generateResponse(
    userMessage: string,
    documentContext: string[],
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(documentContext);
      
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        { role: 'user' as const, content: userMessage }
      ];

      const response = await this.openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-35-turbo',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
      });

      return response.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.';
    } catch (error) {
      console.error('Azure OpenAI error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Summarize document content
   */
  public async summarizeDocument(documentContent: string, documentName: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-35-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise, informative summaries of documents. Focus on key points, main topics, and important details.'
          },
          {
            role: 'user',
            content: `Please provide a comprehensive summary of the following document titled "${documentName}":\n\n${documentContent}`
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || 'Unable to generate summary.';
    } catch (error) {
      console.error('Document summarization error:', error);
      throw new Error('Failed to summarize document');
    }
  }

  /**
   * Extract key topics from document
   */
  public async extractTopics(documentContent: string): Promise<string[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-35-turbo',
        messages: [
          {
            role: 'system',
            content: 'Extract the main topics and themes from the given document. Return them as a comma-separated list of key topics.'
          },
          {
            role: 'user',
            content: `Extract key topics from this document:\n\n${documentContent.substring(0, 3000)}`
          }
        ],
        max_tokens: 200,
        temperature: 0.3,
      });

      const topicsText = response.choices[0]?.message?.content || '';
      return topicsText.split(',').map(topic => topic.trim()).filter(topic => topic.length > 0);
    } catch (error) {
      console.error('Topic extraction error:', error);
      return [];
    }
  }

  private buildSystemPrompt(documentContext: string[]): string {
    const contextText = documentContext.join('\n\n');
    
    return `You are an intelligent document assistant. You have access to the following document content:

${contextText}

Your role is to:
1. Answer questions about the document content accurately and comprehensively
2. Provide relevant citations and page references when possible
3. Help users understand and analyze the document
4. Offer insights and explanations based on the document content
5. If a question cannot be answered from the document, clearly state that

Always be helpful, accurate, and cite specific sections of the document when relevant. If you're unsure about something, acknowledge the uncertainty rather than guessing.`;
  }
}

export const azureOpenAIService = AzureOpenAIService.getInstance();
export default azureOpenAIService;