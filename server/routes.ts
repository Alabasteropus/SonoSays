import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as google from "./lib/google";
import * as openai from "./lib/openai";
import { insertDocumentSchema, insertAiSuggestionSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Auth routes
  app.get("/api/auth/google", (_req, res) => {
    res.redirect(google.getAuthUrl());
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    try {
      const code = req.query.code as string;
      const tokens = await google.getTokens(code);
      const userInfo = await google.getUserInfo(tokens.access_token!);

      let user = await storage.getUserByGoogleId(userInfo.id!);
      if (!user) {
        user = await storage.createUser({
          username: userInfo.name!,
          email: userInfo.email!,
          googleId: userInfo.id!,
          accessToken: tokens.access_token!,
          refreshToken: tokens.refresh_token!
        });
      } else {
        user = await storage.updateUserTokens(
          user.id,
          tokens.access_token!,
          tokens.refresh_token!
        );
      }

      req.session.userId = user.id;
      res.redirect("/");
    } catch (error) {
      console.error("Auth error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // Document routes
  app.get("/api/documents", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const user = await storage.getUser(userId);
      const googleDocs = await google.listDocuments(user!.accessToken);
      const localDocs = await storage.getUserDocuments(userId);

      res.json({
        google: googleDocs,
        local: localDocs
      });
    } catch (error) {
      console.error("List documents error:", error);
      res.status(500).json({ error: "Failed to list documents" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const data = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument({
        ...data,
        userId
      });

      if (data.googleDocId) {
        const user = await storage.getUser(userId);
        await google.updateDocument(
          user!.accessToken,
          data.googleDocId,
          JSON.stringify(data.content)
        );
      }

      res.json(document);
    } catch (error) {
      console.error("Create document error:", error);
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(parseInt(req.params.id));
      if (!document) return res.status(404).json({ error: "Document not found" });

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
      if (!document) return res.status(404).json({ error: "Document not found" });

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

  return httpServer;
}
