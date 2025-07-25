import { NextRequest } from 'next/server';

interface SEOMetrics {
  page: string;
  title: string;
  description: string;
  keywords: string[];
  loadTime: number;
  timestamp: string;
  userAgent: string;
  referrer: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SEOMetrics = await request.json();

    // Validate required fields
    if (!body.page || !body.title) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Log SEO metrics (in production, you'd save this to a database)
    console.log('SEO Metrics:', {
      page: body.page,
      title: body.title,
      description: body.description,
      keywords: body.keywords,
      loadTime: body.loadTime,
      timestamp: body.timestamp,
      userAgent: body.userAgent,
      referrer: body.referrer
    });

    // You could also send this to analytics services like Google Analytics, Mixpanel, etc.

    return new Response(JSON.stringify({ success: true, message: 'Metrics recorded' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error recording SEO metrics:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

export async function GET() {
  // Return basic SEO health check
  return new Response(
    JSON.stringify({
      status: 'healthy',
      features: ['Dynamic metadata', 'Open Graph images', 'Structured data', 'Sitemap generation', 'Robots.txt', 'Canonical URLs', 'Performance monitoring'],
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=300'
      }
    }
  );
}
