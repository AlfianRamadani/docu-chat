import { Metadata } from 'next';
import { generateMetadata, pageMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata: Metadata = generateMetadata(pageMetadata.notFound);

const NotFound = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-xl text-gray-600 mb-4">Oops! Page not found</h2>
        <p className="text-gray-500 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link 
          href="/" 
          className="text-blue-500 hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
        >
          Return to Home
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
