import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as openai from "./lib/openai";
import { insertDocumentSchema, insertAiSuggestionSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Document routes
  app.get("/api/documents", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;

      const { documents, total } = await storage.getAllDocuments(page, limit);
      res.json({
        documents,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("List documents error:", error);
      res.status(500).json({ error: "Failed to list documents" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const data = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(data);
      res.json(document);
    } catch (error) {
      console.error("Create document error:", error);
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(parseInt(req.params.id));
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      const suggestions = await storage.getDocumentSuggestions(document.id);
      res.json({ document, suggestions });
    } catch (error) {
      console.error("Get document error:", error);
      res.status(500).json({ error: "Failed to get document" });
    }
  });

  app.post("/api/documents/:id/suggestions", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      const { type } = req.body;
      let content: string;

      if (type === "completion") {
        const result = await openai.generateCompletion(
          JSON.stringify(document.content)
        );
        content = result.text;
      } else {
        const result = await openai.generateSummary(
          JSON.stringify(document.content)
        );
        content = JSON.stringify(result);
      }

      const suggestion = await storage.createSuggestion({
        documentId,
        type,
        content,
        createdAt: new Date()
      });

      res.json(suggestion);
    } catch (error) {
      console.error("Create suggestion error:", error);
      res.status(500).json({ error: "Failed to create suggestion" });
    }
  });

  app.put("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      const { content } = req.body;
      const updated = await storage.updateDocument(documentId, content);
      res.json(updated);
    } catch (error) {
      console.error("Update document error:", error);
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  return httpServer;
}