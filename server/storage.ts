import {
  type Property, type InsertProperty,
  type Inquiry, type InsertInquiry,
  type AdminUser,
  properties, inquiries, adminUsers,
} from "@shared/schema";
import { db } from "./db";
import { eq, gte, lte, and, desc, count, sql } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
