import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  area: integer("area").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  image: text("image").notNull(),
  featured: boolean("featured").default(false),
  amenities: text("amenities").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const propertyMedia = pgTable("property_media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  caption: text("caption"),
  tags: text("tags").array(),
  roomType: text("room_type"),
  isFeatured: boolean("is_featured").default(false),
  sortOrder: integer("sort_order").default(0),
  platform: text("platform"),
  videoId: text("video_id"),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inquiries = pgTable("inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  service: text("service"),
  message: text("message").notNull(),
  status: text("status").default("new"),
  notes: text("notes"),
  propertyId: varchar("property_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const insertPropertySchema = createInsertSchema(properties).omit({ id: true, createdAt: true });
export const insertInquirySchema = createInsertSchema(inquiries).omit({ id: true, createdAt: true, status: true, notes: true, propertyId: true });
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({ id: true, createdAt: true, lastLogin: true, passwordHash: true }).extend({
  password: z.string().min(6),
});
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const insertMediaSchema = createInsertSchema(propertyMedia).omit({ id: true, createdAt: true });
export const updateMediaSchema = z.object({
  caption: z.string().optional(),
  tags: z.array(z.string()).optional(),
  roomType: z.string().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export const updatePropertySchema = insertPropertySchema.partial();
export const updateInquirySchema = z.object({
  status: z.enum(["new", "in_progress", "responded", "closed"]).optional(),
  notes: z.string().optional(),
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PropertyMedia = typeof propertyMedia.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;
