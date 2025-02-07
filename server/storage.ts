import { 
  type Document, type InsertDocument,
  type AiSuggestion, type InsertAiSuggestion 
} from "@shared/schema";

export interface IStorage {
  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  createDocument(doc: InsertDocument): Promise<Document>;
  updateDocument(id: number, content: any): Promise<Document>;

  // AI Suggestions
  createSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion>;
  getDocumentSuggestions(documentId: number): Promise<AiSuggestion[]>;
}

export class MemStorage implements IStorage {
  private documents: Map<number, Document>;
  private suggestions: Map<number, AiSuggestion>;
  private currentId: number;

  constructor() {
    this.documents = new Map();
    this.suggestions = new Map();
    this.currentId = 1;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values())
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const id = this.currentId++;
    const document: Document = { 
      ...doc, 
      id, 
      lastModified: new Date()
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: number, content: any): Promise<Document> {
    const doc = await this.getDocument(id);
    if (!doc) throw new Error('Document not found');

    const updated = { ...doc, content, lastModified: new Date() };
    this.documents.set(id, updated);
    return updated;
  }

  async createSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const id = this.currentId++;
    const created: AiSuggestion = { ...suggestion, id };
    this.suggestions.set(id, created);
    return created;
  }

  async getDocumentSuggestions(documentId: number): Promise<AiSuggestion[]> {
    return Array.from(this.suggestions.values())
      .filter(s => s.documentId === documentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();