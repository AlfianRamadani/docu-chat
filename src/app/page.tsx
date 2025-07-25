import { Metadata } from 'next';
import { generateMetadata, pageMetadata } from '@/lib/seo';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';

export const metadata: Metadata = generateMetadata(pageMetadata.home);

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex flex-col">
        <div className="flex-1">
          <HeroSection />
        </div>
        <Footer />
      </main>
    </>
  );
}
