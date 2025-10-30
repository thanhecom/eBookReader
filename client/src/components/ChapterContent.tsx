import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { useMemo } from "react";

interface ChapterContentProps {
  content: string;
  title: string;
  isLoading?: boolean;
  onScroll?: (scrollTop: number) => void;
}

export function ChapterContent({ content, title, isLoading, onScroll }: ChapterContentProps) {
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'i', 'b', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
        'div', 'span', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'figure', 'figcaption',
        'table', 'thead', 'tbody', 'tr', 'td', 'th', 'sup', 'sub', 'pre', 'code',
        'dl', 'dt', 'dd', 'hr', 'cite', 'q', 'abbr', 'small', 's', 'mark', 'del', 'ins'
      ],
      ALLOWED_ATTR: ['href', 'class', 'id', 'src', 'alt', 'title', 'width', 'height', 'style'],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });
  }, [content]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải chương...</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" onScrollCapture={(e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('h-full')) {
        onScroll?.(target.scrollTop);
      }
    }}>
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-8 md:py-12">
        <h1 className="text-xl md:text-2xl font-semibold mb-6 md:mb-8" data-testid="text-chapter-title">
          {title}
        </h1>
        <div
          className="prose prose-sm md:prose-base max-w-none leading-relaxed font-serif"
          style={{
            lineHeight: '1.75',
          }}
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          data-testid="text-chapter-content"
        />
      </div>
    </ScrollArea>
  );
}
