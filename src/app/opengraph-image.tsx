import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'DocuChat - AI-Powered Document Chat Assistant';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          backgroundImage: 'linear-gradient(45deg, #f8fafc 0%, #e2e8f0 100%)',
          fontSize: 32,
          fontWeight: 600,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 20,
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                fill="white"
              />
            </svg>
          </div>
          <div
            style={{
              fontSize: 60,
              fontWeight: 700,
              color: '#1e293b',
            }}
          >
            DocuChat
          </div>
        </div>
        
        <div
          style={{
            fontSize: 36,
            color: '#475569',
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          AI-Powered Document Chat Assistant
        </div>
        
        <div
          style={{
            fontSize: 24,
            color: '#64748b',
            textAlign: 'center',
            maxWidth: 900,
            marginTop: 20,
            lineHeight: 1.3,
          }}
        >
          Upload PDFs, Word documents, or text files and get instant answers through natural conversation
        </div>
        
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 40,
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            borderRadius: 12,
            color: 'white',
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          Start Chatting with Your Documents
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}