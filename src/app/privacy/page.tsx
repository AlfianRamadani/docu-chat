import { Metadata } from 'next';
import { generateMetadata, pageMetadata } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Shield, Lock, Eye, Trash2 } from 'lucide-react';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata: Metadata = generateMetadata(pageMetadata.privacy);

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-muted-foreground">Your privacy is our top priority. Here&apos;s how we protect your data.</p>
          </div>

          <div className="grid gap-8">
            <Card className="p-8">
              <div className="flex items-start gap-4">
                <Lock className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Document Security</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      <strong>Session-Only Storage:</strong> Your uploaded documents are only used for your current chat session. They are not permanently stored on our servers.
                    </p>
                    <p>
                      <strong>Automatic Deletion:</strong> All document data is automatically deleted when your session ends or after 24 hours, whichever comes first.
                    </p>
                    <p>
                      <strong>Secure Processing:</strong> Documents are processed in secure, isolated environments using Azure&apos;s enterprise-grade security infrastructure.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4">
                <Eye className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Data Usage</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      <strong>No Training Data:</strong> Your documents and conversations are never used to train our AI models or any third-party models.
                    </p>
                    <p>
                      <strong>No Sharing:</strong> We do not share, sell, or provide access to your documents or conversations to any third parties.
                    </p>
                    <p>
                      <strong>Purpose Limitation:</strong> Your data is only used to provide you with the document analysis and chat functionality you requested.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4">
                <Trash2 className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      <strong>Minimal Retention:</strong> We retain your data only for the duration necessary to provide our service during your active session.
                    </p>
                    <p>
                      <strong>Automatic Cleanup:</strong> All user data, including documents, chat history, and analysis results, are automatically purged from our systems.
                    </p>
                    <p>
                      <strong>No Backups:</strong> We do not create backups or copies of your documents for any purpose.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-primary/5 border-primary/20">
              <h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
              <p className="text-muted-foreground mb-4">DocuChat is built with privacy by design. We believe that your documents and conversations should remain private and secure. This privacy policy reflects our commitment to protecting your data and respecting your privacy.</p>
              <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
