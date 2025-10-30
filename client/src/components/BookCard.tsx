import { Book } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Link } from "wouter";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/book/${book.id}`}>
      <Card 
        className="group overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-200"
        data-testid={`card-book-${book.id}`}
      >
        <div className="aspect-[2/3] bg-muted relative overflow-hidden">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <BookOpen className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}
        </div>
        <div className="p-3 space-y-1">
          <h3 
            className="font-semibold text-lg leading-tight line-clamp-2 min-h-[3.5rem]" 
            data-testid={`text-book-title-${book.id}`}
          >
            {book.title}
          </h3>
          {book.author && (
            <p 
              className="text-xs font-medium text-muted-foreground line-clamp-1"
              data-testid={`text-book-author-${book.id}`}
            >
              {book.author}
            </p>
          )}
          {book.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {book.description}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
