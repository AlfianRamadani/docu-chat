import { Metadata } from 'next';
import { generateMetadata, pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata: Metadata = generateMetadata(pageMetadata.terms);

const Terms = () => {
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
            <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-muted-foreground">Simple, transparent terms for using DocuChat.</p>
          </div>

          <div className="grid gap-8">
            <Card className="p-8">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>You may use DocuChat to analyze and interact with your own documents or documents you have the legal right to use.</p>
                    <p>
                      <strong>Permitted:</strong> Personal documents, business documents you own or have permission to use, public domain content, and educational materials.
                    </p>
                    <p>
                      <strong>Quality:</strong> We strive to provide accurate analysis, but AI responses should be verified for critical decisions.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-destructive mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Prohibited Activities</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      <strong>Copyrighted Material:</strong> Do not upload documents you don&apos;t have the right to use or that violate copyright laws.
                    </p>
                    <p>
                      <strong>Harmful Content:</strong> Do not upload content that is illegal, harmful, or violates others&apos; privacy.
                    </p>
                    <p>
                      <strong>System Abuse:</strong> Do not attempt to overwhelm or exploit our service infrastructure.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4">
                <FileText className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Service Availability</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      <strong>Prototype Status:</strong> DocuChat is currently a prototype application. We strive for reliability but cannot guarantee 100% uptime.
                    </p>
                    <p>
                      <strong>Updates:</strong> We may update, modify, or temporarily suspend the service for maintenance and improvements.
                    </p>
                    <p>
                      <strong>Support:</strong> While in prototype phase, support is provided on a best-effort basis.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Data Ownership</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      <strong>Your Content:</strong> You retain all rights to your uploaded documents and generated conversations.
                    </p>
                    <p>
                      <strong>Our Service:</strong> We own the DocuChat platform, technology, and underlying AI models (excluding your content).
                    </p>
                    <p>
                      <strong>No Claims:</strong> We make no claim to ownership of your documents or data.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-muted/20">
              <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>
              <p className="text-muted-foreground mb-4">DocuChat is provided &quot;as is&quot; without warranties. While we strive for accuracy, AI-generated responses should be verified for important decisions. We are not liable for any damages resulting from use of the service.</p>
              <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
