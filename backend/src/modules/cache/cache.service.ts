import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit {
  private readonly logger = new Logger(CacheService.name);
  private redisClient: Redis;
  private redisPubClient: Redis;
  private redisSubClient: Redis;

  constructor(private configService: ConfigService) {
    const redisConfig = {
      host: this.configService.get('REDIS_HOST') || 'localhost',
      port: this.configService.get('REDIS_PORT') || 6379,
      password: this.configService.get('REDIS_PASSWORD'),
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };

    // Main Redis client for caching
    this.redisClient = new Redis(redisConfig);

    // Pub/Sub clients for real-time tracking
    this.redisPubClient = new Redis(redisConfig);
    this.redisSubClient = new Redis(redisConfig);
  }

  async onModuleInit() {
    this.redisClient.on('connect', () => {
      this.logger.log('Redis client connected');
    });

    this.redisClient.on('error', (error) => {
      this.logger.error('Redis client error:', error);
    });

    this.redisPubClient.on('connect', () => {
      this.logger.log('Redis Pub client connected');
    });

    this.redisSubClient.on('connect', () => {
      this.logger.log('Redis Sub client connected');
    });
  }

  // ==================== Cache Operations ====================

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error.message);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await this.redisClient.setex(key, ttl, stringValue);
      } else {
        await this.redisClient.set(key, stringValue);
      }
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error.message);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error.message);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Error deleting cache pattern ${pattern}:`, error.message);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking cache key ${key}:`, error.message);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.redisClient.ttl(key);
    } catch (error) {
      this.logger.error(`Error getting TTL for key ${key}:`, error.message);
      return -1;
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.redisClient.expire(key, seconds);
    } catch (error) {
      this.logger.error(`Error setting expiry for key ${key}:`, error.message);
    }
  }

  // ==================== Hash Operations ====================

  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.redisClient.hget(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Error getting hash field ${field} from ${key}:`, error.message);
      return null;
    }
  }

  async hset(key: string, field: string, value: any): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      await this.redisClient.hset(key, field, stringValue);
    } catch (error) {
      this.logger.error(`Error setting hash field ${field} in ${key}:`, error.message);
    }
  }

  async hgetall<T>(key: string): Promise<Record<string, T>> {
    try {
      const data = await this.redisClient.hgetall(key);
      const result: Record<string, T> = {};
      for (const [field, value] of Object.entries(data)) {
        result[field] = JSON.parse(value);
      }
      return result;
    } catch (error) {
      this.logger.error(`Error getting all hash fields from ${key}:`, error.message);
      return {};
    }
  }

  async hdel(key: string, field: string): Promise<void> {
    try {
      await this.redisClient.hdel(key, field);
    } catch (error) {
      this.logger.error(`Error deleting hash field ${field} from ${key}:`, error.message);
    }
  }

  // ==================== List Operations ====================

  async lpush(key: string, ...values: any[]): Promise<void> {
    try {
      const stringValues = values.map(v => JSON.stringify(v));
      await this.redisClient.lpush(key, ...stringValues);
    } catch (error) {
      this.logger.error(`Error pushing to list ${key}:`, error.message);
    }
  }

  async rpush(key: string, ...values: any[]): Promise<void> {
    try {
      const stringValues = values.map(v => JSON.stringify(v));
      await this.redisClient.rpush(key, ...stringValues);
    } catch (error) {
      this.logger.error(`Error pushing to list ${key}:`, error.message);
    }
  }

  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const values = await this.redisClient.lrange(key, start, stop);
      return values.map(v => JSON.parse(v));
    } catch (error) {
      this.logger.error(`Error getting list range from ${key}:`, error.message);
      return [];
    }
  }

  async ltrim(key: string, start: number, stop: number): Promise<void> {
    try {
      await this.redisClient.ltrim(key, start, stop);
    } catch (error) {
      this.logger.error(`Error trimming list ${key}:`, error.message);
    }
  }

  // ==================== Set Operations ====================

  async sadd(key: string, ...members: any[]): Promise<void> {
    try {
      const stringMembers = members.map(m => JSON.stringify(m));
      await this.redisClient.sadd(key, ...stringMembers);
    } catch (error) {
      this.logger.error(`Error adding to set ${key}:`, error.message);
    }
  }

  async srem(key: string, ...members: any[]): Promise<void> {
    try {
      const stringMembers = members.map(m => JSON.stringify(m));
      await this.redisClient.srem(key, ...stringMembers);
    } catch (error) {
      this.logger.error(`Error removing from set ${key}:`, error.message);
    }
  }

  async smembers<T>(key: string): Promise<T[]> {
    try {
      const members = await this.redisClient.smembers(key);
      return members.map(m => JSON.parse(m));
    } catch (error) {
      this.logger.error(`Error getting set members from ${key}:`, error.message);
      return [];
    }
  }

  async sismember(key: string, member: any): Promise<boolean> {
    try {
      const stringMember = JSON.stringify(member);
      const result = await this.redisClient.sismember(key, stringMember);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking set membership in ${key}:`, error.message);
      return false;
    }
  }

  // ==================== Pub/Sub Operations ====================

  async publish(channel: string, message: any): Promise<void> {
    try {
      const stringMessage = JSON.stringify(message);
      await this.redisPubClient.publish(channel, stringMessage);
      this.logger.debug(`Published to channel ${channel}`);
    } catch (error) {
      this.logger.error(`Error publishing to channel ${channel}:`, error.message);
    }
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    try {
      await this.redisSubClient.subscribe(channel);
      this.redisSubClient.on('message', (ch, msg) => {
        if (ch === channel) {
          try {
            const message = JSON.parse(msg);
            callback(message);
          } catch (error) {
            this.logger.error(`Error parsing message from ${channel}:`, error.message);
          }
        }
      });
      this.logger.log(`Subscribed to channel ${channel}`);
    } catch (error) {
      this.logger.error(`Error subscribing to channel ${channel}:`, error.message);
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.redisSubClient.unsubscribe(channel);
      this.logger.log(`Unsubscribed from channel ${channel}`);
    } catch (error) {
      this.logger.error(`Error unsubscribing from channel ${channel}:`, error.message);
    }
  }

  // ==================== Sorted Set Operations (for SLA tracking) ====================

  async zadd(key: string, score: number, member: any): Promise<void> {
    try {
      const stringMember = JSON.stringify(member);
      await this.redisClient.zadd(key, score, stringMember);
    } catch (error) {
      this.logger.error(`Error adding to sorted set ${key}:`, error.message);
    }
  }

  async zrem(key: string, member: any): Promise<void> {
    try {
      const stringMember = JSON.stringify(member);
      await this.redisClient.zrem(key, stringMember);
    } catch (error) {
      this.logger.error(`Error removing from sorted set ${key}:`, error.message);
    }
  }

  async zrangebyscore<T>(key: string, min: number, max: number): Promise<T[]> {
    try {
      const members = await this.redisClient.zrangebyscore(key, min, max);
      return members.map(m => JSON.parse(m));
    } catch (error) {
      this.logger.error(`Error getting sorted set range from ${key}:`, error.message);
      return [];
    }
  }

  async zremrangebyscore(key: string, min: number, max: number): Promise<void> {
    try {
      await this.redisClient.zremrangebyscore(key, min, max);
    } catch (error) {
      this.logger.error(`Error removing sorted set range from ${key}:`, error.message);
    }
  }

  // ==================== Increment/Decrement ====================

  async incr(key: string): Promise<number> {
    try {
      return await this.redisClient.incr(key);
    } catch (error) {
      this.logger.error(`Error incrementing key ${key}:`, error.message);
      return 0;
    }
  }

  async decr(key: string): Promise<number> {
    try {
      return await this.redisClient.decr(key);
    } catch (error) {
      this.logger.error(`Error decrementing key ${key}:`, error.message);
      return 0;
    }
  }

  async incrby(key: string, increment: number): Promise<number> {
    try {
      return await this.redisClient.incrby(key, increment);
    } catch (error) {
      this.logger.error(`Error incrementing key ${key} by ${increment}:`, error.message);
      return 0;
    }
  }

  // ==================== Utility Methods ====================

  async flushall(): Promise<void> {
    try {
      await this.redisClient.flushall();
      this.logger.warn('Redis cache flushed');
    } catch (error) {
      this.logger.error('Error flushing cache:', error.message);
    }
  }

  async ping(): Promise<boolean> {
    try {
      const result = await this.redisClient.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Redis ping failed:', error.message);
      return false;
    }
  }

  getClient(): Redis {
    return this.redisClient;
  }

  getPubClient(): Redis {
    return this.redisPubClient;
  }

  getSubClient(): Redis {
    return this.redisSubClient;
  }
}
