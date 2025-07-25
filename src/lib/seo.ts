import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  noFollow?: boolean;
}

export const defaultSEO: SEOConfig = {
  title: 'DocuChat - AI-Powered Document Chat Assistant',
  description: 'Upload PDFs, Word documents, or text files and get instant answers, summaries, and insights through natural conversation with our advanced AI-powered document chat assistant.',
  keywords: ['document chat', 'AI document analysis', 'PDF chat', 'document AI', 'text analysis', 'document questions', 'AI assistant', 'document summarization', 'intelligent document processing', 'conversational AI', 'document insights', 'file analysis', 'AI-powered chat', 'document understanding', 'smart document reader'],
  image: '/og-image.png',
  type: 'website',
  author: 'DocuChat Team'
};

export function generateMetadata(config: Partial<SEOConfig> = {}): Metadata {
  const seo = { ...defaultSEO, ...config };
  const fullTitle = config.title ? `${config.title} | DocuChat` : seo.title;

  return {
    title: fullTitle,
    description: seo.description,
    keywords: seo.keywords?.join(', '),
    authors: seo.author ? [{ name: seo.author }] : undefined,

    // Open Graph
    openGraph: {
      title: fullTitle,
      description: seo.description,
      type: seo.type || 'website',
      url: seo.url,
      images: seo.image
        ? [
            {
              url: seo.image,
              width: 1200,
              height: 630,
              alt: fullTitle
            }
          ]
        : undefined,
      siteName: 'DocuChat',
      locale: 'en_US'
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: seo.description,
      images: seo.image ? [seo.image] : undefined,
      creator: '@docuchat',
      site: '@docuchat'
    },

    // Additional metadata
    robots: {
      index: !seo.noIndex,
      follow: !seo.noFollow,
      googleBot: {
        index: !seo.noIndex,
        follow: !seo.noFollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },

    // Verification and other meta tags
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code'
    },

    // Additional meta tags
    other: {
      'theme-color': '#3b82f6',
      'color-scheme': 'light dark',
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'format-detection': 'telephone=no'
    },

    // Canonical URL
    alternates: {
      canonical: seo.url
    },

    // App-specific metadata
    applicationName: 'DocuChat',
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',

    // Icons
    icons: {
      icon: [{ url: '/favicon.svg', sizes: 'any' }],
      apple: [{ url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/png' }]
    },

    // Manifest
    manifest: '/manifest.json'
  };
}

export function generateStructuredData(config: Partial<SEOConfig> = {}) {
  const seo = { ...defaultSEO, ...config };

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'DocuChat',
    description: seo.description,
    url: seo.url || 'https://docuchat.com',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    creator: {
      '@type': 'Organization',
      name: 'DocuChat Team',
      url: 'https://docuchat.com'
    },
    featureList: ['AI-powered document analysis', 'Natural language document queries', 'PDF, DOCX, and TXT file support', 'Instant document summaries', 'Conversational AI interface', 'Advanced text understanding'],
    screenshot: seo.image,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
      worstRating: '1'
    }
  };
}

export const pageMetadata = {
  home: {
    title: 'AI-Powered Document Chat Assistant',
    description: 'Upload PDFs, Word documents, or text files and get instant answers, summaries, and insights through natural conversation with our advanced AI-powered document chat assistant.',
    keywords: [...defaultSEO.keywords!, 'home', 'landing page', 'document upload']
  },
  upload: {
    title: 'Upload Your Document',
    description: 'Upload PDF, Word, or text files to start chatting with your documents using our AI-powered assistant. Get instant answers and insights from your content.',
    keywords: [...defaultSEO.keywords!, 'upload', 'file upload', 'document upload']
  },
  chat: {
    title: 'Chat with Your Document',
    description: 'Ask questions about your uploaded document and get instant AI-powered answers, summaries, and insights through natural conversation.',
    keywords: [...defaultSEO.keywords!, 'chat', 'conversation', 'document questions']
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'Learn how DocuChat protects your privacy and handles your document data with our comprehensive privacy policy.',
    keywords: ['privacy policy', 'data protection', 'privacy', 'security']
  },
  terms: {
    title: 'Terms of Service',
    description: "Read DocuChat's terms of service to understand the rules and guidelines for using our AI-powered document chat platform.",
    keywords: ['terms of service', 'terms and conditions', 'legal', 'usage policy']
  },
  notFound: {
    title: 'Page Not Found',
    description: "The page you're looking for doesn't exist. Return to DocuChat to continue chatting with your documents.",
    keywords: ['404', 'not found', 'error'],
    noIndex: true
  }
};
