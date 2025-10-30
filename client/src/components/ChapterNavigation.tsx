import { Chapter } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChapterNavigationProps {
  chapters: { id: string; title: string; order: number }[];
  currentChapterId: string;
  onChapterSelect: (chapterId: string) => void;
}

export function ChapterNavigation({
  chapters,
  currentChapterId,
  onChapterSelect,
}: ChapterNavigationProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b">
        <h2 className="font-semibold text-sm">Mục lục</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => onChapterSelect(chapter.id)}
              className={cn(
                "w-full text-left px-4 py-2 rounded-md text-sm transition-colors hover-elevate active-elevate-2",
                currentChapterId === chapter.id
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-foreground"
              )}
              data-testid={`button-chapter-${chapter.id}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground min-w-[2rem] mt-0.5">
                  {chapter.order}
                </span>
                <span className="line-clamp-2 leading-snug">{chapter.title}</span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
