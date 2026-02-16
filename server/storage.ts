import { type Property, type InsertProperty, type Inquiry, type InsertInquiry, properties, inquiries } from "@shared/schema";
import { db } from "./db";
import { eq, gte, lte, and, ilike } from "drizzle-orm";

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
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getInquiries(): Promise<Inquiry[]>;
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

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const [created] = await db.insert(inquiries).values(inquiry).returning();
    return created;
  }

  async getInquiries(): Promise<Inquiry[]> {
    return db.select().from(inquiries);
  }
}

export const storage = new DatabaseStorage();
