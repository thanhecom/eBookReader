import { useQuery } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import { BookGrid } from "@/components/BookGrid";
import { BookGridSkeleton } from "@/components/BookSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Library() {
  const { data: books, isLoading, error } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold" data-testid="text-app-title">
              Thư viện của tôi
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading && <BookGridSkeleton />}
        
        {error && (
          <EmptyState
            title="Lỗi tải dữ liệu"
            description="Không thể tải danh sách sách. Vui lòng thử lại sau."
          />
        )}

        {books && books.length === 0 && (
          <EmptyState
            title="Thư viện trống"
            description="Không tìm thấy sách nào trong thư mục 'books'. Hãy thêm các file EPUB vào thư mục để bắt đầu đọc."
          />
        )}

        {books && books.length > 0 && <BookGrid books={books} />}
      </main>
    </div>
  );
}
