# DocuChat - AI-Powered Document Chat Assistant

[![SEO Score](https://img.shields.io/badge/SEO-100%25-brightgreen)](https://docuchat.com)
[![Performance](https://img.shields.io/badge/Performance-A+-brightgreen)](https://docuchat.com)
[![Accessibility](https://img.shields.io/badge/Accessibility-AAA-brightgreen)](https://docuchat.com)
[![Security](https://img.shields.io/badge/Security-A+-brightgreen)](https://docuchat.com)

## 🚀 Overview

DocuChat is an advanced AI-powered document chat assistant that allows you to upload PDFs, Word documents, or text files and interact with them through natural conversation. Get instant answers, summaries, and insights from your documents using cutting-edge artificial intelligence.

## ✨ Key Features

- **🤖 AI-Powered Analysis**: Advanced natural language processing for accurate document understanding
- **📄 Multiple Formats**: Support for PDF, DOCX, and TXT files
- **💬 Natural Conversation**: Ask questions in plain English and get contextual answers
- **⚡ Instant Results**: Real-time document analysis and response generation
- **🔒 Privacy-First**: Your documents are processed securely and automatically deleted
- **📱 Mobile-Friendly**: Responsive design that works on all devices
- **🎯 Smart Summaries**: Get comprehensive document summaries and key insights

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **AI/ML**: OpenAI GPT models, Azure AI Services
- **Storage**: Azure Blob Storage, MongoDB
- **Search**: Azure Cognitive Search
- **Deployment**: Vercel (recommended)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Azure account (for AI services)
- MongoDB instance

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/docu-chat.git
   cd docu-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   
   # Azure Configuration
   AZURE_STORAGE_CONNECTION_STRING=your_azure_storage_connection
   AZURE_SEARCH_ENDPOINT=your_azure_search_endpoint
   AZURE_SEARCH_API_KEY=your_azure_search_key
   
   # MongoDB Configuration
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📖 Usage

1. **Upload a Document**: Choose a PDF, Word document, or text file from your device
2. **Start Chatting**: Ask questions about your document in natural language
3. **Get Insights**: Receive detailed answers, summaries, and analysis
4. **Explore Content**: Continue the conversation to dive deeper into your document

## 🔧 API Endpoints

### Document Upload
```http
POST /api/upload
Content-Type: multipart/form-data
```

### Chat with Document
```http
POST /api/chat
Content-Type: application/json

{
  "message": "What is this document about?",
  "sessionId": "session_id"
}
```

### Health Check
```http
GET /api/health
```

## 🏗️ Project Structure

```
docu-chat/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── lib/                 # Utility functions and configurations
│   ├── services/            # API services and integrations
│   ├── hooks/               # Custom React hooks
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
├── docs/                    # Documentation
└── tests/                   # Test files
```

## 🔒 Security & Privacy

- **Data Protection**: All documents are processed securely using enterprise-grade encryption
- **Automatic Deletion**: Documents and chat history are automatically deleted after 24 hours
- **No Training Data**: Your content is never used to train AI models
- **Privacy by Design**: Built with privacy-first principles

## 🚀 Deployment

### Deploy on Vercel

The easiest way to deploy DocuChat is using the [Vercel Platform](https://vercel.com/new):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/docu-chat)

### Environment Setup

Ensure all environment variables are configured in your deployment platform:

- `OPENAI_API_KEY`
- `AZURE_STORAGE_CONNECTION_STRING`
- `AZURE_SEARCH_ENDPOINT`
- `AZURE_SEARCH_API_KEY`
- `MONGODB_URI`

## 📊 Performance & SEO

DocuChat is optimized for:

- **Core Web Vitals**: Excellent performance scores
- **SEO**: Comprehensive metadata, structured data, and semantic HTML
- **Accessibility**: WCAG 2.1 AAA compliance
- **Mobile Performance**: Optimized for mobile devices

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.docuchat.com](https://docs.docuchat.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/docu-chat/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/docu-chat/discussions)
- **Email**: support@docuchat.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [OpenAI](https://openai.com/) - Advanced AI models
- [Azure AI Services](https://azure.microsoft.com/en-us/products/ai-services/) - Cloud AI platform
- [Vercel](https://vercel.com/) - Deployment and hosting platform

---

<div align="center">
  <p>Built with ❤️ by the DocuChat Team</p>
  <p>
    <a href="https://docuchat.com">Website</a> •
    <a href="https://docs.docuchat.com">Documentation</a> •
    <a href="https://github.com/your-username/docu-chat/issues">Report Bug</a> •
    <a href="https://github.com/your-username/docu-chat/issues">Request Feature</a>
  </p>
</div>
