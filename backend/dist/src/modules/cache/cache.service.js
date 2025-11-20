"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let CacheService = CacheService_1 = class CacheService {
    configService;
    logger = new common_1.Logger(CacheService_1.name);
    redisClient;
    redisPubClient;
    redisSubClient;
    constructor(configService) {
        this.configService = configService;
        const redisConfig = {
            host: this.configService.get('REDIS_HOST') || 'localhost',
            port: this.configService.get('REDIS_PORT') || 6379,
            password: this.configService.get('REDIS_PASSWORD'),
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        };
        this.redisClient = new ioredis_1.default(redisConfig);
        this.redisPubClient = new ioredis_1.default(redisConfig);
        this.redisSubClient = new ioredis_1.default(redisConfig);
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
    async get(key) {
        try {
            const value = await this.redisClient.get(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            this.logger.error(`Error getting cache key ${key}:`, error.message);
            return null;
        }
    }
    async set(key, value, ttl) {
        try {
            const stringValue = JSON.stringify(value);
            if (ttl) {
                await this.redisClient.setex(key, ttl, stringValue);
            }
            else {
                await this.redisClient.set(key, stringValue);
            }
        }
        catch (error) {
            this.logger.error(`Error setting cache key ${key}:`, error.message);
        }
    }
    async del(key) {
        try {
            await this.redisClient.del(key);
        }
        catch (error) {
            this.logger.error(`Error deleting cache key ${key}:`, error.message);
        }
    }
    async delPattern(pattern) {
        try {
            const keys = await this.redisClient.keys(pattern);
            if (keys.length > 0) {
                await this.redisClient.del(...keys);
            }
        }
        catch (error) {
            this.logger.error(`Error deleting cache pattern ${pattern}:`, error.message);
        }
    }
    async exists(key) {
        try {
            const result = await this.redisClient.exists(key);
            return result === 1;
        }
        catch (error) {
            this.logger.error(`Error checking cache key ${key}:`, error.message);
            return false;
        }
    }
    async ttl(key) {
        try {
            return await this.redisClient.ttl(key);
        }
        catch (error) {
            this.logger.error(`Error getting TTL for key ${key}:`, error.message);
            return -1;
        }
    }
    async expire(key, seconds) {
        try {
            await this.redisClient.expire(key, seconds);
        }
        catch (error) {
            this.logger.error(`Error setting expiry for key ${key}:`, error.message);
        }
    }
    async hget(key, field) {
        try {
            const value = await this.redisClient.hget(key, field);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            this.logger.error(`Error getting hash field ${field} from ${key}:`, error.message);
            return null;
        }
    }
    async hset(key, field, value) {
        try {
            const stringValue = JSON.stringify(value);
            await this.redisClient.hset(key, field, stringValue);
        }
        catch (error) {
            this.logger.error(`Error setting hash field ${field} in ${key}:`, error.message);
        }
    }
    async hgetall(key) {
        try {
            const data = await this.redisClient.hgetall(key);
            const result = {};
            for (const [field, value] of Object.entries(data)) {
                result[field] = JSON.parse(value);
            }
            return result;
        }
        catch (error) {
            this.logger.error(`Error getting all hash fields from ${key}:`, error.message);
            return {};
        }
    }
    async hdel(key, field) {
        try {
            await this.redisClient.hdel(key, field);
        }
        catch (error) {
            this.logger.error(`Error deleting hash field ${field} from ${key}:`, error.message);
        }
    }
    async lpush(key, ...values) {
        try {
            const stringValues = values.map(v => JSON.stringify(v));
            await this.redisClient.lpush(key, ...stringValues);
        }
        catch (error) {
            this.logger.error(`Error pushing to list ${key}:`, error.message);
        }
    }
    async rpush(key, ...values) {
        try {
            const stringValues = values.map(v => JSON.stringify(v));
            await this.redisClient.rpush(key, ...stringValues);
        }
        catch (error) {
            this.logger.error(`Error pushing to list ${key}:`, error.message);
        }
    }
    async lrange(key, start, stop) {
        try {
            const values = await this.redisClient.lrange(key, start, stop);
            return values.map(v => JSON.parse(v));
        }
        catch (error) {
            this.logger.error(`Error getting list range from ${key}:`, error.message);
            return [];
        }
    }
    async ltrim(key, start, stop) {
        try {
            await this.redisClient.ltrim(key, start, stop);
        }
        catch (error) {
            this.logger.error(`Error trimming list ${key}:`, error.message);
        }
    }
    async sadd(key, ...members) {
        try {
            const stringMembers = members.map(m => JSON.stringify(m));
            await this.redisClient.sadd(key, ...stringMembers);
        }
        catch (error) {
            this.logger.error(`Error adding to set ${key}:`, error.message);
        }
    }
    async srem(key, ...members) {
        try {
            const stringMembers = members.map(m => JSON.stringify(m));
            await this.redisClient.srem(key, ...stringMembers);
        }
        catch (error) {
            this.logger.error(`Error removing from set ${key}:`, error.message);
        }
    }
    async smembers(key) {
        try {
            const members = await this.redisClient.smembers(key);
            return members.map(m => JSON.parse(m));
        }
        catch (error) {
            this.logger.error(`Error getting set members from ${key}:`, error.message);
            return [];
        }
    }
    async sismember(key, member) {
        try {
            const stringMember = JSON.stringify(member);
            const result = await this.redisClient.sismember(key, stringMember);
            return result === 1;
        }
        catch (error) {
            this.logger.error(`Error checking set membership in ${key}:`, error.message);
            return false;
        }
    }
    async publish(channel, message) {
        try {
            const stringMessage = JSON.stringify(message);
            await this.redisPubClient.publish(channel, stringMessage);
            this.logger.debug(`Published to channel ${channel}`);
        }
        catch (error) {
            this.logger.error(`Error publishing to channel ${channel}:`, error.message);
        }
    }
    async subscribe(channel, callback) {
        try {
            await this.redisSubClient.subscribe(channel);
            this.redisSubClient.on('message', (ch, msg) => {
                if (ch === channel) {
                    try {
                        const message = JSON.parse(msg);
                        callback(message);
                    }
                    catch (error) {
                        this.logger.error(`Error parsing message from ${channel}:`, error.message);
                    }
                }
            });
            this.logger.log(`Subscribed to channel ${channel}`);
        }
        catch (error) {
            this.logger.error(`Error subscribing to channel ${channel}:`, error.message);
        }
    }
    async unsubscribe(channel) {
        try {
            await this.redisSubClient.unsubscribe(channel);
            this.logger.log(`Unsubscribed from channel ${channel}`);
        }
        catch (error) {
            this.logger.error(`Error unsubscribing from channel ${channel}:`, error.message);
        }
    }
    async zadd(key, score, member) {
        try {
            const stringMember = JSON.stringify(member);
            await this.redisClient.zadd(key, score, stringMember);
        }
        catch (error) {
            this.logger.error(`Error adding to sorted set ${key}:`, error.message);
        }
    }
    async zrem(key, member) {
        try {
            const stringMember = JSON.stringify(member);
            await this.redisClient.zrem(key, stringMember);
        }
        catch (error) {
            this.logger.error(`Error removing from sorted set ${key}:`, error.message);
        }
    }
    async zrangebyscore(key, min, max) {
        try {
            const members = await this.redisClient.zrangebyscore(key, min, max);
            return members.map(m => JSON.parse(m));
        }
        catch (error) {
            this.logger.error(`Error getting sorted set range from ${key}:`, error.message);
            return [];
        }
    }
    async zremrangebyscore(key, min, max) {
        try {
            await this.redisClient.zremrangebyscore(key, min, max);
        }
        catch (error) {
            this.logger.error(`Error removing sorted set range from ${key}:`, error.message);
        }
    }
    async incr(key) {
        try {
            return await this.redisClient.incr(key);
        }
        catch (error) {
            this.logger.error(`Error incrementing key ${key}:`, error.message);
            return 0;
        }
    }
    async decr(key) {
        try {
            return await this.redisClient.decr(key);
        }
        catch (error) {
            this.logger.error(`Error decrementing key ${key}:`, error.message);
            return 0;
        }
    }
    async incrby(key, increment) {
        try {
            return await this.redisClient.incrby(key, increment);
        }
        catch (error) {
            this.logger.error(`Error incrementing key ${key} by ${increment}:`, error.message);
            return 0;
        }
    }
    async flushall() {
        try {
            await this.redisClient.flushall();
            this.logger.warn('Redis cache flushed');
        }
        catch (error) {
            this.logger.error('Error flushing cache:', error.message);
        }
    }
    async ping() {
        try {
            const result = await this.redisClient.ping();
            return result === 'PONG';
        }
        catch (error) {
            this.logger.error('Redis ping failed:', error.message);
            return false;
        }
    }
    getClient() {
        return this.redisClient;
    }
    getPubClient() {
        return this.redisPubClient;
    }
    getSubClient() {
        return this.redisSubClient;
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CacheService);
//# sourceMappingURL=cache.service.js.map