import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ChapterControlsProps {
  currentChapter: number;
  totalChapters: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function ChapterControls({
  currentChapter,
  totalChapters,
  onPrevious,
  onNext,
}: ChapterControlsProps) {
  const hasPrevious = currentChapter > 1;
  const hasNext = currentChapter < totalChapters;

  return (
    <div className="flex items-center justify-between gap-4 p-4 border-t bg-background">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={!hasPrevious}
        data-testid="button-previous-chapter"
        className="flex-1 sm:flex-none"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Chương trước</span>
        <span className="sm:hidden">Trước</span>
      </Button>

      <div className="text-sm text-muted-foreground text-center" data-testid="text-chapter-position">
        Chương {currentChapter} / {totalChapters}
      </div>

      <Button
        variant="outline"
        onClick={onNext}
        disabled={!hasNext}
        data-testid="button-next-chapter"
        className="flex-1 sm:flex-none"
      >
        <span className="hidden sm:inline">Chương sau</span>
        <span className="sm:hidden">Sau</span>
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
