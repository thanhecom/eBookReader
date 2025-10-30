import AdmZip from "adm-zip";
import { parseStringPromise } from "xml2js";
import * as path from "path";
import { Book, Chapter, BookContent } from "@shared/schema";
import { randomUUID, createHash } from "crypto";

function generateBookId(filename: string): string {
  return createHash('sha256').update(filename).digest('hex').slice(0, 32);
}

interface OpfMetadata {
  title?: string[];
  creator?: string[];
  description?: string[];
  language?: string[];
  publisher?: string[];
}

interface OpfManifest {
  item: Array<{
    $: {
      id: string;
      href: string;
      "media-type": string;
    };
  }>;
}

interface OpfSpine {
  itemref: Array<{
    $: {
      idref: string;
    };
  }>;
}

interface OpfPackage {
  package: {
    metadata: OpfMetadata[];
    manifest: OpfManifest[];
    spine: OpfSpine[];
  };
}

interface NavPoint {
  $?: {
    id?: string;
    playOrder?: string;
  };
  navLabel?: Array<{
    text?: string[];
  }>;
  content?: Array<{
    $: {
      src: string;
    };
  }>;
}

interface TocNcx {
  ncx: {
    navMap?: Array<{
      navPoint?: NavPoint[];
    }>;
  };
}

export class EpubParser {
  private zip: AdmZip;
  private rootPath: string = "";
  private opfPath: string = "";

  constructor(filePath: string) {
    this.zip = new AdmZip(filePath);
  }

  private async findOpfPath(): Promise<string> {
    const containerEntry = this.zip.getEntry("META-INF/container.xml");
    if (!containerEntry) {
      throw new Error("Invalid EPUB: Missing container.xml");
    }

    const containerXml = containerEntry.getData().toString("utf8");
    const container = await parseStringPromise(containerXml);
    
    const rootfile = container?.container?.rootfiles?.[0]?.rootfile?.[0];
    if (!rootfile || !rootfile.$["full-path"]) {
      throw new Error("Invalid EPUB: Missing rootfile");
    }

    this.opfPath = rootfile.$["full-path"];
    this.rootPath = path.dirname(this.opfPath);
    return this.opfPath;
  }

  private async parseOpf(): Promise<OpfPackage> {
    const opfEntry = this.zip.getEntry(this.opfPath);
    if (!opfEntry) {
      throw new Error("Invalid EPUB: Missing OPF file");
    }

    const opfXml = opfEntry.getData().toString("utf8");
    return await parseStringPromise(opfXml);
  }

  async extractMetadata(filename: string): Promise<Book> {
    await this.findOpfPath();
    const opf = await this.parseOpf();

    const metadata = opf.package.metadata[0];
    const manifest = opf.package.manifest[0];

    const title = metadata.title?.[0] || filename.replace(".epub", "");
    const author = metadata.creator?.[0] || undefined;
    const description = metadata.description?.[0] || undefined;
    const language = metadata.language?.[0] || undefined;
    const publisher = metadata.publisher?.[0] || undefined;

    let coverImage: string | undefined;
    const coverItem = manifest.item.find(
      (item) =>
        item.$["media-type"].startsWith("image/") &&
        (item.$.id.toLowerCase().includes("cover") ||
          item.$.href.toLowerCase().includes("cover"))
    );

    if (coverItem) {
      const coverPath = path.join(this.rootPath, coverItem.$.href);
      const coverEntry = this.zip.getEntry(coverPath);
      if (coverEntry) {
        const imageData = coverEntry.getData();
        const base64 = imageData.toString("base64");
        const mimeType = coverItem.$["media-type"];
        coverImage = `data:${mimeType};base64,${base64}`;
      }
    }

    return {
      id: generateBookId(filename),
      filename,
      title,
      author,
      description,
      coverImage,
      language,
      publisher,
    };
  }

  async extractContent(bookId: string): Promise<BookContent> {
    await this.findOpfPath();
    const opf = await this.parseOpf();

    const manifest = opf.package.manifest[0];
    const spine = opf.package.spine[0];

    const chapters: Chapter[] = [];
    const toc: Array<{ id: string; title: string; order: number }> = [];

    let ncxFile: string | undefined;
    const ncxItem = manifest.item.find(
      (item) => item.$["media-type"] === "application/x-dtbncx+xml"
    );
    if (ncxItem) {
      ncxFile = path.join(this.rootPath, ncxItem.$.href);
    }

    let chapterTitles: Map<string, string> = new Map();
    if (ncxFile) {
      const ncxEntry = this.zip.getEntry(ncxFile);
      if (ncxEntry) {
        const ncxXml = ncxEntry.getData().toString("utf8");
        const ncx: TocNcx = await parseStringPromise(ncxXml);
        const navPoints = ncx?.ncx?.navMap?.[0]?.navPoint || [];
        
        navPoints.forEach((navPoint) => {
          const title = navPoint.navLabel?.[0]?.text?.[0] || "";
          const src = navPoint.content?.[0]?.$?.src || "";
          const href = src.split("#")[0];
          chapterTitles.set(href, title);
        });
      }
    }

    spine.itemref.forEach((itemref, index) => {
      const idref = itemref.$.idref;
      const item = manifest.item.find((i) => i.$.id === idref);
      
      if (item && item.$["media-type"] === "application/xhtml+xml") {
        const chapterPath = path.join(this.rootPath, item.$.href);
        const chapterEntry = this.zip.getEntry(chapterPath);
        
        if (chapterEntry) {
          const content = chapterEntry.getData().toString("utf8");
          const cleanContent = this.cleanHtmlContent(content);
          
          const chapterId = randomUUID();
          const chapterTitle = chapterTitles.get(item.$.href) || `Chương ${index + 1}`;
          
          chapters.push({
            id: chapterId,
            title: chapterTitle,
            content: cleanContent,
            order: index + 1,
          });

          toc.push({
            id: chapterId,
            title: chapterTitle,
            order: index + 1,
          });
        }
      }
    });

    return {
      bookId,
      chapters,
      toc,
    };
  }

  private cleanHtmlContent(html: string): string {
    let clean = html.replace(/<\?xml[^>]*\?>/g, "");
    clean = clean.replace(/<!DOCTYPE[^>]*>/g, "");
    clean = clean.replace(/<html[^>]*>/g, "");
    clean = clean.replace(/<\/html>/g, "");
    clean = clean.replace(/<head[^>]*>[\s\S]*?<\/head>/g, "");
    clean = clean.replace(/<body[^>]*>/g, "");
    clean = clean.replace(/<\/body>/g, "");
    
    clean = clean.replace(/epub:type="[^"]*"/g, "");
    clean = clean.replace(/xmlns[^=]*="[^"]*"/g, "");
    
    return clean.trim();
  }
}
