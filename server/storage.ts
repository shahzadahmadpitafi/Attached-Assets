import {
  type Property, type InsertProperty,
  type Inquiry, type InsertInquiry,
  type AdminUser,
  type PropertyMedia, type InsertMedia,
  properties, inquiries, adminUsers, propertyMedia,
} from "@shared/schema";
import { db } from "./db";
import { eq, gte, lte, and, desc, asc, count, sql } from "drizzle-orm";

export interface IStorage {
  getProperties(filters?: {
    status?: string;
    type?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    featured?: boolean;
  }): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, data: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getInquiries(): Promise<Inquiry[]>;
  getInquiry(id: string): Promise<Inquiry | undefined>;
  updateInquiry(id: string, data: { status?: string; notes?: string }): Promise<Inquiry | undefined>;
  deleteInquiry(id: string): Promise<boolean>;
  getAdminByEmail(email: string): Promise<AdminUser | undefined>;
  createAdminUser(user: { email: string; passwordHash: string; name: string; role: string }): Promise<AdminUser>;
  updateAdminLastLogin(id: string): Promise<void>;
  getDashboardMetrics(): Promise<{
    totalProperties: number;
    forSale: number;
    forRent: number;
    totalInquiries: number;
    newInquiries: number;
    respondedInquiries: number;
  }>;
  getMediaByProperty(propertyId: string, type?: string): Promise<PropertyMedia[]>;
  getMedia(id: string): Promise<PropertyMedia | undefined>;
  createMedia(media: InsertMedia): Promise<PropertyMedia>;
  updateMedia(id: string, data: Partial<InsertMedia>): Promise<PropertyMedia | undefined>;
  deleteMedia(id: string): Promise<boolean>;
  deleteMediaByProperty(propertyId: string): Promise<number>;
  reorderMedia(propertyId: string, mediaIds: string[]): Promise<void>;
  setFeaturedMedia(propertyId: string, mediaId: string): Promise<void>;
  syncPropertyImage(propertyId: string): Promise<void>;
  backfillLegacyImages(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getProperties(filters?: {
    status?: string;
    type?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    featured?: boolean;
  }): Promise<Property[]> {
    const conditions = [];
    if (filters?.status) conditions.push(eq(properties.status, filters.status));
    if (filters?.type) conditions.push(eq(properties.type, filters.type));
    if (filters?.city) conditions.push(eq(properties.city, filters.city));
    if (filters?.minPrice) conditions.push(gte(properties.price, filters.minPrice));
    if (filters?.maxPrice) conditions.push(lte(properties.price, filters.maxPrice));
    if (filters?.bedrooms) conditions.push(gte(properties.bedrooms, filters.bedrooms));
    if (filters?.featured) conditions.push(eq(properties.featured, true));

    if (conditions.length > 0) {
      return db.select().from(properties).where(and(...conditions));
    }
    return db.select().from(properties);
  }

  async getProperty(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [created] = await db.insert(properties).values(property).returning();
    return created;
  }

  async updateProperty(id: string, data: Partial<InsertProperty>): Promise<Property | undefined> {
    const [updated] = await db.update(properties).set(data).where(eq(properties.id, id)).returning();
    return updated;
  }

  async deleteProperty(id: string): Promise<boolean> {
    await db.delete(propertyMedia).where(eq(propertyMedia.propertyId, id));
    const result = await db.delete(properties).where(eq(properties.id, id)).returning();
    return result.length > 0;
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const [created] = await db.insert(inquiries).values(inquiry).returning();
    return created;
  }

  async getInquiries(): Promise<Inquiry[]> {
    return db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
  }

  async getInquiry(id: string): Promise<Inquiry | undefined> {
    const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    return inquiry;
  }

  async updateInquiry(id: string, data: { status?: string; notes?: string }): Promise<Inquiry | undefined> {
    const [updated] = await db.update(inquiries).set(data).where(eq(inquiries.id, id)).returning();
    return updated;
  }

  async deleteInquiry(id: string): Promise<boolean> {
    const result = await db.delete(inquiries).where(eq(inquiries.id, id)).returning();
    return result.length > 0;
  }

  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return user;
  }

  async createAdminUser(user: { email: string; passwordHash: string; name: string; role: string }): Promise<AdminUser> {
    const [created] = await db.insert(adminUsers).values(user).returning();
    return created;
  }

  async updateAdminLastLogin(id: string): Promise<void> {
    await db.update(adminUsers).set({ lastLogin: new Date() }).where(eq(adminUsers.id, id));
  }

  async getDashboardMetrics() {
    const allProps = await db.select().from(properties);
    const allInq = await db.select().from(inquiries);

    return {
      totalProperties: allProps.length,
      forSale: allProps.filter(p => p.status === "For Sale").length,
      forRent: allProps.filter(p => p.status === "For Rent").length,
      totalInquiries: allInq.length,
      newInquiries: allInq.filter(i => i.status === "new" || !i.status).length,
      respondedInquiries: allInq.filter(i => i.status === "responded" || i.status === "closed").length,
    };
  }

  async getMediaByProperty(propertyId: string, type?: string): Promise<PropertyMedia[]> {
    const conditions = [eq(propertyMedia.propertyId, propertyId)];
    if (type) conditions.push(eq(propertyMedia.type, type));
    return db.select().from(propertyMedia)
      .where(and(...conditions))
      .orderBy(asc(propertyMedia.sortOrder), asc(propertyMedia.createdAt));
  }

  async getMedia(id: string): Promise<PropertyMedia | undefined> {
    const [media] = await db.select().from(propertyMedia).where(eq(propertyMedia.id, id));
    return media;
  }

  async createMedia(media: InsertMedia): Promise<PropertyMedia> {
    const [created] = await db.insert(propertyMedia).values(media).returning();
    return created;
  }

  async updateMedia(id: string, data: Partial<InsertMedia>): Promise<PropertyMedia | undefined> {
    const [updated] = await db.update(propertyMedia).set(data).where(eq(propertyMedia.id, id)).returning();
    return updated;
  }

  async deleteMedia(id: string): Promise<boolean> {
    const result = await db.delete(propertyMedia).where(eq(propertyMedia.id, id)).returning();
    return result.length > 0;
  }

  async deleteMediaByProperty(propertyId: string): Promise<number> {
    const result = await db.delete(propertyMedia).where(eq(propertyMedia.propertyId, propertyId)).returning();
    return result.length;
  }

  async reorderMedia(propertyId: string, mediaIds: string[]): Promise<void> {
    for (let i = 0; i < mediaIds.length; i++) {
      await db.update(propertyMedia)
        .set({ sortOrder: i })
        .where(and(eq(propertyMedia.id, mediaIds[i]), eq(propertyMedia.propertyId, propertyId)));
    }
  }

  async setFeaturedMedia(propertyId: string, mediaId: string): Promise<void> {
    await db.update(propertyMedia)
      .set({ isFeatured: false })
      .where(eq(propertyMedia.propertyId, propertyId));
    await db.update(propertyMedia)
      .set({ isFeatured: true })
      .where(and(eq(propertyMedia.id, mediaId), eq(propertyMedia.propertyId, propertyId)));
    await this.syncPropertyImage(propertyId);
  }

  async syncPropertyImage(propertyId: string): Promise<void> {
    const allMedia = await this.getMediaByProperty(propertyId, "image");
    const featured = allMedia.find(m => m.isFeatured);
    const imageUrl = featured?.url || allMedia[0]?.url;
    if (imageUrl) {
      await db.update(properties).set({ image: imageUrl }).where(eq(properties.id, propertyId));
    }
  }

  async backfillLegacyImages(): Promise<void> {
    const allProps = await db.select().from(properties);
    for (const prop of allProps) {
      const existing = await this.getMediaByProperty(prop.id, "image");
      if (existing.length === 0 && prop.image) {
        await db.insert(propertyMedia).values({
          propertyId: prop.id,
          type: "image",
          url: prop.image,
          caption: prop.title,
          isFeatured: true,
          sortOrder: 0,
        });
      }
    }
  }
}

export const storage = new DatabaseStorage();
