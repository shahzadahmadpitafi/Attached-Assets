import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, numeric } from "drizzle-orm/pg-core";
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

export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
  department: text("department"),
  specialization: text("specialization"),
  bio: text("bio"),
  shortBio: text("short_bio"),
  email: text("email").notNull(),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  photo: text("photo"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  education: text("education"),
  certifications: text("certifications").array().default(sql`'{}'`),
  languages: text("languages").array().default(sql`'{}'`),
  expertise: text("expertise").array().default(sql`'{}'`),
  socialLinkedin: text("social_linkedin"),
  socialFacebook: text("social_facebook"),
  socialInstagram: text("social_instagram"),
  socialTwitter: text("social_twitter"),
  statsPropertiesSold: integer("stats_properties_sold").default(0),
  statsHappyClients: integer("stats_happy_clients").default(0),
  statsDealsCompleted: integer("stats_deals_completed").default(0),
  statsAvgRating: numeric("stats_avg_rating", { precision: 2, scale: 1 }).default("0"),
  featured: boolean("featured").default(false),
  showOnWebsite: boolean("show_on_website").default(true),
  showOnTeamPage: boolean("show_on_team_page").default(true),
  showOnContactPage: boolean("show_on_contact_page").default(false),
  yearsOfExperience: integer("years_of_experience").default(0),
  internalNotes: text("internal_notes"),
  alternatePhone: text("alternate_phone"),
  officeExtension: text("office_extension"),
  createdAt: timestamp("created_at").defaultNow(),
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

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ id: true, createdAt: true });
export const updateTeamMemberSchema = insertTeamMemberSchema.partial();

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
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
