import React from 'react';
import { Copy, Check, ExternalLink, Quote } from 'lucide-react';
import { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const renderContent = (text: string) => {
    // Split content into lines for processing
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={currentIndex++} className="text-2xl font-bold mb-4 mt-6 text-primary flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={currentIndex++} className="text-xl font-semibold mb-3 mt-5 text-primary flex items-center gap-2">
            <div className="w-1 h-5 bg-primary/70 rounded-full"></div>
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={currentIndex++} className="text-lg font-medium mb-2 mt-4 text-primary flex items-center gap-2">
            <div className="w-1 h-4 bg-primary/50 rounded-full"></div>
            {line.substring(4)}
          </h3>
        );
      }
      // Bold text with **
      else if (line.includes('**') && !line.startsWith('```')) {
        const boldRegex = /\*\*(.*?)\*\*/g;
        const boldMatches = [];
        let match;
        
        while ((match = boldRegex.exec(line)) !== null) {
          boldMatches.push(match);
        }
        
        if (boldMatches.length > 0) {
          const parts = [];
          let lastIndex = 0;
          
          boldMatches.forEach((match, idx) => {
            // Add text before bold
            if (match.index > lastIndex) {
              parts.push(line.substring(lastIndex, match.index));
            }
            // Add bold text
            parts.push(<strong key={`bold-${idx}`} className="font-semibold text-primary">{match[1]}</strong>);
            lastIndex = match.index + match[0].length;
          });
          
          // Add remaining text
          if (lastIndex < line.length) {
            parts.push(line.substring(lastIndex));
          }
          
          elements.push(
            <p key={currentIndex++} className="my-2 leading-relaxed">
              {parts}
            </p>
          );
        } else {
          elements.push(<p key={currentIndex++} className="my-2 leading-relaxed">{line}</p>);
        }
      }
      // Code blocks
      else if (line.startsWith('```')) {
        const codeId = `code-${currentIndex}`;
        const language = line.substring(3) || 'text';
        let codeContent = '';
        let j = i + 1;
        
        while (j < lines.length && !lines[j].startsWith('```')) {
          codeContent += lines[j] + '\n';
          j++;
        }
        
        elements.push(
          <div key={currentIndex++} className="my-4 relative group">
            <div className="flex items-center justify-between bg-muted/50 px-4 py-2 rounded-t-lg border-b">
              <span className="text-xs font-medium text-muted-foreground uppercase">{language}</span>
              <button
                onClick={() => copyToClipboard(codeContent, codeId)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                title="Copy code"
              >
                {copiedStates[codeId] ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <pre className="bg-muted p-4 rounded-b-lg overflow-x-auto">
              <code className="text-sm font-mono">{codeContent}</code>
            </pre>
          </div>
        );
        
        i = j; // Skip to end of code block
      }
      // Blockquotes
      else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={currentIndex++} className="border-l-4 border-primary/30 pl-4 py-2 my-4 bg-muted/20 rounded-r-lg">
            <div className="flex items-start gap-2">
              <Quote className="w-4 h-4 text-primary/60 mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground italic">{line.substring(2)}</p>
            </div>
          </blockquote>
        );
      }
      // Lists
      else if (line.match(/^[\s]*[-*+]\s/)) {
        const listItems = [line];
        let j = i + 1;
        
        while (j < lines.length && (lines[j].match(/^[\s]*[-*+]\s/) || lines[j].trim() === '')) {
          if (lines[j].trim() !== '') {
            listItems.push(lines[j]);
          }
          j++;
        }
        
        elements.push(
          <ul key={currentIndex++} className="my-4 space-y-2">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span>{item.replace(/^[\s]*[-*+]\s/, '')}</span>
              </li>
            ))}
          </ul>
        );
        
        i = j - 1; // Skip processed lines
      }
      // Numbered lists
      else if (line.match(/^[\s]*\d+[\.\)]\s/)) {
        const listItems = [line];
        let j = i + 1;
        
        while (j < lines.length && (lines[j].match(/^[\s]*\d+[\.\)]\s/) || lines[j].trim() === '')) {
          if (lines[j].trim() !== '') {
            listItems.push(lines[j]);
          }
          j++;
        }
        
        elements.push(
          <ol key={currentIndex++} className="my-4 space-y-2">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary flex-shrink-0">
                  {idx + 1}
                </div>
                <span>{item.replace(/^[\s]*\d+[\.\)]\s/, '')}</span>
              </li>
            ))}
          </ol>
        );
        
        i = j - 1; // Skip processed lines
      }
      // Links
      else if (line.includes('[') && line.includes('](')) {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let match;
        const links: { text: string; url: string; index: number }[] = [];
        
        while ((match = linkRegex.exec(line)) !== null) {
          links.push({
            text: match[1],
            url: match[2],
            index: match.index
          });
        }
        
        if (links.length > 0) {
          elements.push(
            <p key={currentIndex++} className="my-2 leading-relaxed">
              {links.map((link, idx) => (
                <span key={idx}>
                  {idx === 0 ? line.substring(0, link.index) : ''}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline underline-offset-2 inline-flex items-center gap-1"
                  >
                    {link.text}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </span>
              ))}
            </p>
          );
        } else {
          elements.push(<p key={currentIndex++} className="my-2 leading-relaxed">{line}</p>);
        }
      }
      // Regular paragraphs
      else if (line.trim() !== '') {
        // Handle inline code
        if (line.includes('`')) {
          const parts = line.split('`');
          const inlineElements = parts.map((part, idx) => {
            if (idx % 2 === 1) {
              return (
                <code key={idx} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                  {part}
                </code>
              );
            }
            return part;
          });
          
          elements.push(
            <p key={currentIndex++} className="my-2 leading-relaxed">
              {inlineElements}
            </p>
          );
        } else {
          elements.push(
            <p key={currentIndex++} className="my-2 leading-relaxed">
              {line}
            </p>
          );
        }
      }
      // Empty lines
      else {
        elements.push(<div key={currentIndex++} className="h-2" />);
      }
    }

    return elements;
  };

  return (
    <div className={`markdown-content prose prose-sm max-w-none ${className}`}>
      {renderContent(content)}
    </div>
  );
};

export default MarkdownRenderer;