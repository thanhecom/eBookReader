import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface ChapterContentProps {
  content: string;
  title: string;
  isLoading?: boolean;
}

export function ChapterContent({ content, title, isLoading }: ChapterContentProps) {
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
    <ScrollArea className="h-full">
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-8 md:py-12">
        <h1 className="text-xl md:text-2xl font-semibold mb-6 md:mb-8" data-testid="text-chapter-title">
          {title}
        </h1>
        <div
          className="prose prose-sm md:prose-base max-w-none leading-relaxed font-serif"
          style={{
            lineHeight: '1.75',
          }}
          dangerouslySetInnerHTML={{ __html: content }}
          data-testid="text-chapter-content"
        />
      </div>
    </ScrollArea>
  );
}
