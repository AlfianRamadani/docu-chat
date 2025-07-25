'use client';

import { Button } from '@/components/ui/button';
import { MessageSquare, Upload, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

const HeroSection = () => {
  const navigate = useRouter();

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-subtle overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="container mx-auto px-6 py-12 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero badge */}
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50 shadow-soft mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Powered by Advanced AI</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Chat with Your</span> <span className="bg-gradient-hero bg-clip-text text-blue-400">Documents</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">Upload PDFs, Word documents, or text files and get instant answers, summaries, and insights through natural conversation.</p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button variant="hero" size="lg" className="px-8 py-6 text-lg border-b-6 rounded-2xl hover:border-b-0" onClick={() => navigate.push('/upload')}>
              <Upload className="w-5 h-5 mr-2" />
              Start Chatting with Your Document
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Easy Upload</h3>
              <p className="text-muted-foreground text-sm">Drag & drop or select PDF, DOCX, and TXT files</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Natural Chat</h3>
              <p className="text-muted-foreground text-sm">Ask questions in plain English and get accurate answers</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">AI-Powered</h3>
              <p className="text-muted-foreground text-sm">Advanced AI provides summaries and detailed analysis</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
