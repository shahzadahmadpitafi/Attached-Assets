import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInquirySchema, insertPropertySchema, updatePropertySchema, updateInquirySchema, loginSchema, insertMediaSchema, updateMediaSchema } from "@shared/schema";
import bcrypt from "bcryptjs";

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ── Public Routes ──

  app.get("/api/properties", async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.status) filters.status = String(req.query.status);
      if (req.query.type) filters.type = String(req.query.type);
      if (req.query.city) filters.city = String(req.query.city);
      if (req.query.minPrice) filters.minPrice = Number(req.query.minPrice);
      if (req.query.maxPrice) filters.maxPrice = Number(req.query.maxPrice);
      if (req.query.bedrooms) filters.bedrooms = Number(req.query.bedrooms);
      if (req.query.featured === "true") filters.featured = true;

      const properties = await storage.getProperties(
        Object.keys(filters).length > 0 ? filters : undefined
      );
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) return res.status(404).json({ message: "Property not found" });
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post("/api/inquiries", async (req, res) => {
    try {
      const parsed = insertInquirySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid form data", errors: parsed.error.flatten() });
      }
      const inquiry = await storage.createInquiry(parsed.data);
      res.status(201).json(inquiry);
    } catch (error) {
      res.status(500).json({ message: "Failed to submit inquiry" });
    }
  });

  // ── Admin Auth Routes ──

  app.post("/api/admin/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid credentials format" });
      }

      const user = await storage.getAdminByEmail(parsed.data.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      await storage.updateAdminLastLogin(user.id);

      req.session.adminId = user.id;
      req.session.adminEmail = user.email;
      req.session.adminRole = user.role;

      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/admin/me", requireAdmin, (req, res) => {
    res.json({
      id: req.session.adminId,
      email: req.session.adminEmail,
      role: req.session.adminRole,
    });
  });

  // ── Admin Dashboard ──

  app.get("/api/admin/metrics", requireAdmin, async (_req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // ── Admin Properties CRUD ──

  app.get("/api/admin/properties", requireAdmin, async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.status) filters.status = String(req.query.status);
      if (req.query.type) filters.type = String(req.query.type);
      if (req.query.city) filters.city = String(req.query.city);
      const properties = await storage.getProperties(
        Object.keys(filters).length > 0 ? filters : undefined
      );
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/admin/properties/:id", requireAdmin, async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) return res.status(404).json({ message: "Property not found" });
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post("/api/admin/properties", requireAdmin, async (req, res) => {
    try {
      const parsed = insertPropertySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid property data", errors: parsed.error.flatten() });
      }
      const property = await storage.createProperty(parsed.data);
      res.status(201).json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.put("/api/admin/properties/:id", requireAdmin, async (req, res) => {
    try {
      const parsed = updatePropertySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid property data", errors: parsed.error.flatten() });
      }
      const property = await storage.updateProperty(req.params.id, parsed.data);
      if (!property) return res.status(404).json({ message: "Property not found" });
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete("/api/admin/properties/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteProperty(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Property not found" });
      res.json({ message: "Property deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // ── Public Media Routes ──

  app.get("/api/properties/:id/media", async (req, res) => {
    try {
      const media = await storage.getMediaByProperty(req.params.id);
      res.json(media);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  // ── Admin Media CRUD ──

  app.get("/api/admin/properties/:id/media", requireAdmin, async (req, res) => {
    try {
      const type = req.query.type ? String(req.query.type) : undefined;
      const media = await storage.getMediaByProperty(req.params.id, type);
      res.json(media);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.post("/api/admin/properties/:id/media", requireAdmin, async (req, res) => {
    try {
      const mediaData = { ...req.body, propertyId: req.params.id };
      const parsed = insertMediaSchema.safeParse(mediaData);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid media data", errors: parsed.error.flatten() });
      }
      const media = await storage.createMedia(parsed.data);
      if (media.type === "image") {
        await storage.syncPropertyImage(req.params.id);
      }
      res.status(201).json(media);
    } catch (error) {
      res.status(500).json({ message: "Failed to create media" });
    }
  });

  app.patch("/api/admin/media/:id", requireAdmin, async (req, res) => {
    try {
      const parsed = updateMediaSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid media data", errors: parsed.error.flatten() });
      }
      const media = await storage.updateMedia(req.params.id, parsed.data);
      if (!media) return res.status(404).json({ message: "Media not found" });
      res.json(media);
    } catch (error) {
      res.status(500).json({ message: "Failed to update media" });
    }
  });

  app.delete("/api/admin/media/:id", requireAdmin, async (req, res) => {
    try {
      const mediaItem = await storage.getMedia(req.params.id);
      if (!mediaItem) return res.status(404).json({ message: "Media not found" });
      await storage.deleteMedia(req.params.id);
      if (mediaItem.type === "image") {
        await storage.syncPropertyImage(mediaItem.propertyId);
      }
      res.json({ message: "Media deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  app.post("/api/admin/properties/:id/media/reorder", requireAdmin, async (req, res) => {
    try {
      const { mediaIds } = req.body;
      if (!Array.isArray(mediaIds)) {
        return res.status(400).json({ message: "mediaIds must be an array" });
      }
      await storage.reorderMedia(req.params.id, mediaIds);
      res.json({ message: "Media reordered" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reorder media" });
    }
  });

  app.post("/api/admin/media/:id/featured", requireAdmin, async (req, res) => {
    try {
      const media = await storage.getMedia(req.params.id);
      if (!media) return res.status(404).json({ message: "Media not found" });
      await storage.setFeaturedMedia(media.propertyId, media.id);
      res.json({ message: "Featured media set" });
    } catch (error) {
      res.status(500).json({ message: "Failed to set featured media" });
    }
  });

  // ── Admin Inquiries CRUD ──

  app.get("/api/admin/inquiries", requireAdmin, async (_req, res) => {
    try {
      const inqs = await storage.getInquiries();
      res.json(inqs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  app.patch("/api/admin/inquiries/:id", requireAdmin, async (req, res) => {
    try {
      const parsed = updateInquirySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      }
      const inquiry = await storage.updateInquiry(req.params.id, parsed.data);
      if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
      res.json(inquiry);
    } catch (error) {
      res.status(500).json({ message: "Failed to update inquiry" });
    }
  });

  app.delete("/api/admin/inquiries/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteInquiry(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Inquiry not found" });
      res.json({ message: "Inquiry deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete inquiry" });
    }
  });

  return httpServer;
}
