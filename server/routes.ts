import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { promises as fs } from "fs";
import * as path from "path";
import { EpubParser } from "./epubParser";
import { Book } from "@shared/schema";

const BOOKS_FOLDER = path.join(process.cwd(), "books");

async function ensureBooksFolder() {
  try {
    await fs.access(BOOKS_FOLDER);
  } catch {
    await fs.mkdir(BOOKS_FOLDER, { recursive: true });
  }
}

const bookFilePaths = new Map<string, string>();

async function scanAndLoadBooks(): Promise<void> {
  await ensureBooksFolder();
  
  try {
    const files = await fs.readdir(BOOKS_FOLDER);
    const epubFiles = files.filter((file) => file.toLowerCase().endsWith(".epub"));

    for (const file of epubFiles) {
      const filePath = path.join(BOOKS_FOLDER, file);
      try {
        const parser = new EpubParser(filePath);
        const book = await parser.extractMetadata(file);
        storage.setBook(book);
        bookFilePaths.set(book.id, filePath);
      } catch (error) {
        console.error(`Error parsing ${file}:`, error);
      }
    }
  } catch (error) {
    console.error("Error scanning books folder:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  await scanAndLoadBooks();

  app.get("/api/books", async (req, res) => {
    try {
      const books = await storage.getBooks();
      res.json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const book = await storage.getBook(id);
      
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      
      res.json(book);
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json({ error: "Failed to fetch book" });
    }
  });

  app.get("/api/books/:id/content", async (req, res) => {
    try {
      const { id } = req.params;
      let content = await storage.getBookContent(id);
      
      if (!content) {
        const filePath = bookFilePaths.get(id);
        if (!filePath) {
          return res.status(404).json({ error: "Book not found" });
        }
        
        const parser = new EpubParser(filePath);
        content = await parser.extractContent(id);
        storage.setBookContent(content);
      }
      
      res.json(content);
    } catch (error) {
      console.error("Error fetching book content:", error);
      res.status(500).json({ error: "Failed to fetch book content" });
    }
  });

  app.get("/api/books/:bookId/chapters/:chapterId", async (req, res) => {
    try {
      const { bookId, chapterId } = req.params;
      const chapter = await storage.getChapter(bookId, chapterId);
      
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      
      res.json(chapter);
    } catch (error) {
      console.error("Error fetching chapter:", error);
      res.status(500).json({ error: "Failed to fetch chapter" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
