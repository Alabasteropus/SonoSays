import { 
  users, type User, type InsertUser,
  documents, type Document, type InsertDocument,
  aiSuggestions, type AiSuggestion, type InsertAiSuggestion 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserTokens(id: number, accessToken: string, refreshToken: string): Promise<User>;

  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getUserDocuments(userId: number): Promise<Document[]>;
  createDocument(doc: InsertDocument): Promise<Document>;
  updateDocument(id: number, content: any): Promise<Document>;

  // AI Suggestions
  createSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion>;
  getDocumentSuggestions(documentId: number): Promise<AiSuggestion[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private suggestions: Map<number, AiSuggestion>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.suggestions = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.googleId === googleId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUserTokens(id: number, accessToken: string, refreshToken: string): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error('User not found');

    const updated = { ...user, accessToken, refreshToken };
    this.users.set(id, updated);
    return updated;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getUserDocuments(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.userId === userId);
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const id = this.currentId++;
    const document: Document = { 
      ...doc, 
      id, 
      lastSynced: new Date(),
      googleDocId: doc.googleDocId || null
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: number, content: any): Promise<Document> {
    const doc = await this.getDocument(id);
    if (!doc) throw new Error('Document not found');

    const updated = { ...doc, content, lastSynced: new Date() };
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