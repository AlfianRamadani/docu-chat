import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return new Response('Missing URL parameter', { status: 400 });
  }

  try {
    // Basic URL validation
    const urlObj = new URL(url);
    
    // Check if it's a valid domain (you can add your domain whitelist here)
    const allowedDomains = ['docuchat.com', 'localhost'];
    const isAllowed = allowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );

    if (!isAllowed) {
      return new Response('Domain not allowed', { status: 403 });
    }

    return new Response(
      JSON.stringify({
        url: urlObj.toString(),
        canonical: urlObj.toString(),
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      }
    );
  } catch {
    return new Response('Invalid URL', { status: 400 });
  }
}