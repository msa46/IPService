import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { ipRequests } from './schema';
import { eq } from 'drizzle-orm';

const client = createClient({
  url: 'file:ratelimit.db',
});

const db = drizzle(client);

// Service class to handle IP tracking
export class RateLimitService {
    private readonly resetIntervalMs: number;
  
    constructor(resetIntervalMinutes: number = 60) {
      this.resetIntervalMs = resetIntervalMinutes * 60 * 1000;
    }
  
    private shouldReset(lastReset: Date): boolean {
      const now = new Date();
      return now.getTime() - lastReset.getTime() >= this.resetIntervalMs;
    }
  
    async recordRequest(ip: string): Promise<{ count: number; isLimited: boolean }> {
      // Get current record for IP
      const records = await db.select().from(ipRequests).where(eq(ipRequests.ip, ip));
      const record = records[0];
  
      if (!record) {
        // First request from this IP
        await db.insert(ipRequests).values({ ip });
        return { count: 1, isLimited: false };
      }
  
      // Check if we should reset the counter
      if (this.shouldReset(record.lastReset)) {
        await db.update(ipRequests)
          .set({ 
            count: 1, 
            lastReset: new Date() 
          })
          .where(eq(ipRequests.ip, ip));
        return { count: 1, isLimited: false };
      }
  
      // Increment the counter
      const newCount = record.count + 1;
      await db.update(ipRequests)
        .set({ count: newCount })
        .where(eq(ipRequests.ip, ip));
  
      // You can adjust the limit as needed
      const isLimited = newCount > 100;
  
      return { count: newCount, isLimited };
    }
  
    async getStats(ip: string) {
      const records = await db.select().from(ipRequests).where(eq(ipRequests.ip, ip));
      return records[0];
    }
  }