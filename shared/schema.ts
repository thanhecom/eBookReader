import { z } from "zod";

// EPUB Book schema
export const bookSchema = z.object({
  id: z.string(),
  filename: z.string(),
  title: z.string(),
  author: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(), // base64 encoded image
  language: z.string().optional(),
  publisher: z.string().optional(),
});

export type Book = z.infer<typeof bookSchema>;

// EPUB Chapter schema
export const chapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  order: z.number(),
});

export type Chapter = z.infer<typeof chapterSchema>;

// Book content structure
export const bookContentSchema = z.object({
  bookId: z.string(),
  chapters: z.array(chapterSchema),
  toc: z.array(z.object({
    id: z.string(),
    title: z.string(),
    order: z.number(),
  })),
});

export type BookContent = z.infer<typeof bookContentSchema>;
