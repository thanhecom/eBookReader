import { Book, BookContent, Chapter } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  getBookContent(id: string): Promise<BookContent | undefined>;
  getChapter(bookId: string, chapterId: string): Promise<Chapter | undefined>;
}

export class MemStorage implements IStorage {
  private books: Map<string, Book>;
  private bookContents: Map<string, BookContent>;

  constructor() {
    this.books = new Map();
    this.bookContents = new Map();
  }

  async getBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async getBook(id: string): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async getBookContent(id: string): Promise<BookContent | undefined> {
    return this.bookContents.get(id);
  }

  async getChapter(bookId: string, chapterId: string): Promise<Chapter | undefined> {
    const content = this.bookContents.get(bookId);
    if (!content) return undefined;
    return content.chapters.find(ch => ch.id === chapterId);
  }

  setBook(book: Book): void {
    this.books.set(book.id, book);
  }

  setBookContent(content: BookContent): void {
    this.bookContents.set(content.bookId, content);
  }
}

export const storage = new MemStorage();
