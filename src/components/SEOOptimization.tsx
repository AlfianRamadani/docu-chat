'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface SEOOptimizationProps {
  title?: string;
  description?: string;
  keywords?: string[];
}

export default function SEOOptimization({ title, description, keywords }: SEOOptimizationProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Record page load time for SEO metrics
    const startTime = performance.now();
    
    const recordMetrics = () => {
      const loadTime = performance.now() - startTime;
      
      // Send metrics to our API
      fetch('/api/seo/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: pathname,
          title: title || document.title,
          description: description || '',
          keywords: keywords || [],
          loadTime: Math.round(loadTime),
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        }),
      }).catch(console.error);
    };

    // Record metrics when page is fully loaded
    if (document.readyState === 'complete') {
      recordMetrics();
    } else {
      window.addEventListener('load', recordMetrics);
      return () => window.removeEventListener('load', recordMetrics);
    }
  }, [pathname, title, description, keywords]);

  useEffect(() => {
    // Add structured data for breadcrumbs if on a nested page
    if (pathname !== '/') {
      const breadcrumbData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://docuchat.com',
          },
        ],
      };

      // Add current page to breadcrumb
      const pathSegments = pathname.split('/').filter(Boolean);
      pathSegments.forEach((segment, index) => {
        breadcrumbData.itemListElement.push({
          '@type': 'ListItem',
          position: index + 2,
          name: segment.charAt(0).toUpperCase() + segment.slice(1),
          item: `https://docuchat.com/${pathSegments.slice(0, index + 1).join('/')}`,
        });
      });

      // Add breadcrumb structured data to head
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(breadcrumbData);
      script.id = 'breadcrumb-schema';
      
      // Remove existing breadcrumb schema
      const existing = document.getElementById('breadcrumb-schema');
      if (existing) {
        existing.remove();
      }
      
      document.head.appendChild(script);

      return () => {
        const scriptToRemove = document.getElementById('breadcrumb-schema');
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    }
  }, [pathname]);

  useEffect(() => {
    // Add FAQ structured data for relevant pages
    if (pathname === '/' || pathname === '/upload') {
      const faqData = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What file formats does DocuChat support?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'DocuChat supports PDF files, Word documents (DOCX), and plain text files (TXT). You can upload these formats to start chatting with your documents.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is my document data secure?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, your documents are processed securely and are only stored temporarily during your session. All data is automatically deleted after 24 hours or when your session ends.',
            },
          },
          {
            '@type': 'Question',
            name: 'How does the AI understand my documents?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'DocuChat uses advanced AI models to analyze and understand your document content, allowing you to ask questions in natural language and receive accurate, contextual answers.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I use DocuChat for free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, DocuChat is currently available as a free prototype. You can upload documents and chat with them without any cost.',
            },
          },
        ],
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(faqData);
      script.id = 'faq-schema';
      
      // Remove existing FAQ schema
      const existing = document.getElementById('faq-schema');
      if (existing) {
        existing.remove();
      }
      
      document.head.appendChild(script);

      return () => {
        const scriptToRemove = document.getElementById('faq-schema');
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    }
  }, [pathname]);

  // Add preload hints for critical resources
  useEffect(() => {
    const addPreloadHint = (href: string, as: string, type?: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      if (type) link.type = type;
      document.head.appendChild(link);
    };

    // Preload critical fonts
    addPreloadHint('/fonts/geist-sans.woff2', 'font', 'font/woff2');
    
    // Preload critical images based on page
    if (pathname === '/') {
      addPreloadHint('/hero-image.png', 'image');
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}