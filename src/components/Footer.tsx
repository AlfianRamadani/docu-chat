'use client';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{theme === 'light' ? 'Light' : 'Dark'} Mode</span>
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-8 w-8 p-0">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border text-center text-xs text-muted-foreground">© 2024 DocuChat. Your documents, your privacy, guaranteed.</div>
      </div>
    </footer>
  );
};

export default Footer;
