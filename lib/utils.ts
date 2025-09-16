import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate slug from product names
export function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

// Generate comparison slug
export function generateComparisonSlug(product1: string, product2: string): string {
  return `${generateSlug(product1)}-vs-${generateSlug(product2)}`;
}

// Simple in-memory cache for development
class SimpleCache {
  private cache = new Map<string, { data: any; expiry: number }>();
  
  set(key: string, data: any, ttlSeconds = 3600): void {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expiry });
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
}

export const cache = new SimpleCache();

// Format price for display
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

// Parse JSON safely - now handles both string and native JSON from Prisma
export function safeJsonParse(data: string | object | null | undefined, fallback: any = null): any {
  if (!data) return fallback;
  
  // If it's already an object (from Prisma Json type), return it directly
  if (typeof data === 'object') {
    return data;
  }
  
  // If it's a string, try to parse it
  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

// For PostgreSQL with Prisma Json type, we can pass objects directly
export function jsonStringify(obj: any): any {
  // With PostgreSQL Json type, Prisma handles the conversion automatically
  // We just return the object as-is
  return obj;
}