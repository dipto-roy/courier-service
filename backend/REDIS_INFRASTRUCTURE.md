# Redis Infrastructure Documentation

## Overview

This document describes the Redis infrastructure implementation for the FastX Courier Service backend. The implementation includes caching, pub/sub for real-time updates, and automated SLA monitoring.

## Architecture

### Components

1. **CacheModule** - Global Redis cache service
2. **SLA Watcher** - Automated SLA monitoring with cron jobs
3. **Bull Queues** - Background job processing
4. **Tracking Enhancement** - Real-time updates via Redis pub/sub

## 1. Cache Module

### Configuration

The CacheModule is registered as a **global module**, making it available throughout the application without explicit imports.

```typescript
// src/modules/cache/cache.module.ts
@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
```

### Redis Clients

Three separate Redis clients are created:
- **Main Client**: For general caching operations
- **Pub Client**: For publishing messages
- **Sub Client**: For subscribing to channels

### Cache Operations

#### Simple Cache Operations
```typescript
// Get cached value
const value = await cacheService.get<Type>('key');

// Set value with TTL (seconds)
await cacheService.set('key', value, 120);

// Delete key
await cacheService.del('key');

// Delete by pattern
await cacheService.delPattern('tracking:*');

// Check existence
const exists = await cacheService.exists('key');

// Get/Set TTL
const ttl = await cacheService.ttl('key');
await cacheService.expire('key', 300);
```

#### Hash Operations
```typescript
// Set hash field
await cacheService.hset('shipment:123', 'status', 'DELIVERED');

// Get hash field
const status = await cacheService.hget('shipment:123', 'status');

// Get all hash fields
const shipment = await cacheService.hgetall('shipment:123');

// Delete hash field
await cacheService.hdel('shipment:123', 'status');
```

#### List Operations
```typescript
// Add to list
await cacheService.lpush('log:shipment:123', JSON.stringify(event));
await cacheService.rpush('queue:tasks', JSON.stringify(task));

// Get list range
const logs = await cacheService.lrange('log:shipment:123', 0, -1);

// Trim list
await cacheService.ltrim('log:shipment:123', 0, 99); // Keep last 100 items
```

#### Set Operations
```typescript
// Add to set
await cacheService.sadd('active:riders', riderId);

// Check membership
const isActive = await cacheService.sismember('active:riders', riderId);

// Get all members
const activeRiders = await cacheService.smembers('active:riders');

// Remove from set
await cacheService.srem('active:riders', riderId);
```

#### Sorted Sets (for time-based queries)
```typescript
// Add with score (timestamp)
await cacheService.zadd('sla:deadlines', Date.now(), shipmentId);

// Get by score range
const expired = await cacheService.zrangebyscore('sla:deadlines', 0, Date.now());

// Remove by score range
await cacheService.zremrangebyscore('sla:deadlines', 0, Date.now());

// Remove member
await cacheService.zrem('sla:deadlines', shipmentId);
```

#### Pub/Sub
```typescript
// Publish message
await cacheService.publish('tracking:AWB123', {
  awb: 'AWB123',
  status: 'DELIVERED',
  timestamp: new Date()
});

// Subscribe to channel
await cacheService.subscribe('tracking:*', (channel, message) => {
  console.log('Received:', channel, message);
});

// Unsubscribe
await cacheService.unsubscribe('tracking:AWB123');
```

#### Counters
```typescript
// Increment
const newCount = await cacheService.incr('stats:deliveries:today');

// Increment by amount
await cacheService.incrby('stats:revenue', 1500);

// Decrement
await cacheService.decr('stats:pending:pickups');
```

### Cache Keys

#### Tracking Data
- `tracking:public:{awb}` - Public tracking data (TTL: 2 minutes)
- `tracking:detailed:{awb}` - Authenticated tracking data (TTL: 5 minutes)

#### Rider Location
- `rider:location:latest:{riderId}` - Latest rider position (TTL: 5 minutes)

#### SLA Violation Flags
- `sla:pickup:{shipmentId}` - Pickup violation notified (TTL: 24 hours)
- `sla:delivery:{shipmentId}` - Delivery violation notified (TTL: 12 hours)
- `sla:intransit:{shipmentId}` - In-transit violation notified (TTL: 12 hours)

#### Session Data
- `session:{userId}:{token}` - User session data (TTL: based on JWT expiry)

## 2. Pub/Sub Channels

### Tracking Channels
- `tracking:{awb}` - Shipment-specific tracking updates
- `tracking:all` - All tracking events for system monitoring
- `tracking:{awb}:location` - Location updates for specific shipment

### Rider Channels
- `rider:location:{riderId}` - Individual rider GPS updates
- `rider:status:{riderId}` - Rider status changes

### SLA Channels
- `sla-violations` - All SLA violation alerts for operations dashboard

### Message Format
```typescript
{
  type: 'status_change' | 'location_update' | 'sla_violation',
  shipmentId: string,
  awb: string,
  data: any,
  timestamp: Date
}
```

## 3. SLA Watcher System

### Configuration

SLA thresholds:
- **Pickup SLA**: 24 hours (PENDING → PICKED_UP)
- **Delivery SLA**: 72 hours (PICKED_UP → DELIVERED)
- **In-Transit SLA**: 48 hours (no status update)

### Cron Schedule

The SLA watcher runs **every 10 minutes** using `@Cron(CronExpression.EVERY_10_MINUTES)`.

### Violation Detection

#### Pickup SLA
- Checks shipments in `PENDING` status older than 24 hours
- Notifies: Merchant (email)
- Action: Internal alert for operations

#### Delivery SLA
- Checks shipments in `PICKED_UP`, `IN_TRANSIT`, or `OUT_FOR_DELIVERY` older than 72 hours
- Notifies: Merchant (email), Customer (SMS), Rider (push)
- Action: Multi-stakeholder alert

#### In-Transit SLA
- Checks shipments in `IN_TRANSIT` without update for 48 hours
- Notifies: Internal operations team only
- Action: Hub status check trigger

### Notification Caching

To prevent duplicate notifications:
- **Pickup violations**: 24-hour cache (re-check after 24h)
- **Delivery violations**: 12-hour cache (escalate if not resolved)
- **In-Transit violations**: 12-hour cache (periodic reminders)

### REST API Endpoints

```http
# Get overall SLA statistics
GET /api/sla/statistics
Authorization: Bearer {token}
Roles: ADMIN, SUPPORT, HUB_STAFF

Response:
{
  "pickupSLA": {
    "violations": 5,
    "threshold": 24
  },
  "deliverySLA": {
    "violations": 12,
    "threshold": 72
  },
  "totalViolations": 17,
  "lastChecked": "2025-01-28T10:30:00Z"
}
```

```http
# Check specific shipment SLA
GET /api/sla/shipment/:shipmentId
Authorization: Bearer {token}
Roles: ADMIN, SUPPORT, MERCHANT

Response:
{
  "isViolated": true,
  "violations": ["delivery-sla"],
  "details": {
    "awb": "AWB123456789",
    "status": "IN_TRANSIT",
    "createdAt": "2025-01-25T10:00:00Z",
    "pickupSLA": 24,
    "deliverySLA": 72
  }
}
```

```http
# Get Bull queue status
GET /api/sla/queue/status
Authorization: Bearer {token}
Roles: ADMIN

Response:
{
  "waiting": 0,
  "active": 2,
  "completed": 145,
  "failed": 3,
  "total": 150
}
```

## 4. Bull Queue Infrastructure

### Queues

#### 1. Notifications Queue (`notifications`)
**Job Types:**
- `send-notification` - Generic notification
- `send-email` - Email notification
- `send-sms` - SMS notification
- `send-push` - Push notification

#### 2. SLA Watcher Queue (`sla-watcher`)
**Job Types:**
- `pickup-sla-violation` - Pickup SLA exceeded
- `delivery-sla-violation` - Delivery SLA exceeded
- `intransit-sla-violation` - In-transit timeout

### Configuration

```typescript
// Redis connection for Bull
BullModule.forRoot({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
  },
})
```

### Job Processing

Each queue has a processor that handles jobs asynchronously:

```typescript
@Processor('sla-watcher')
export class SlaWatcherProcessor {
  @Process('pickup-sla-violation')
  async handlePickupViolation(job: Job) {
    // Log to audit trail
    // Create support ticket
    // Escalate if needed
  }

  @Process('delivery-sla-violation')
  async handleDeliveryViolation(job: Job) {
    // Log with rider info
    // Auto-escalate to supervisor
    // Create high-priority ticket
  }

  @Process('intransit-sla-violation')
  async handleInTransitViolation(job: Job) {
    // Request hub status update
    // Check GPS tracking
    // Alert operations
  }
}
```

## 5. Tracking Enhancement

### Cache-First Strategy

```typescript
async trackShipment(awb: string) {
  // 1. Check cache first
  const cacheKey = `tracking:public:${awb}`;
  const cached = await this.cacheService.get(cacheKey);
  
  if (cached) {
    return cached; // Fast response from cache
  }

  // 2. Query database if not cached
  const tracking = await this.fetchFromDatabase(awb);

  // 3. Cache for future requests (2-minute TTL)
  await this.cacheService.set(cacheKey, tracking, 120);

  return tracking;
}
```

### Dual Broadcasting

Status changes are broadcast through both channels:

```typescript
async emitStatusChange(shipment, oldStatus, newStatus) {
  // 1. Invalidate cache
  await this.cacheService.del(`tracking:public:${shipment.awb}`);
  await this.cacheService.del(`tracking:detailed:${shipment.awb}`);

  // 2. Redis pub/sub (internal services)
  await this.cacheService.publish(`tracking:${shipment.awb}`, {
    awb: shipment.awb,
    oldStatus,
    newStatus,
    timestamp: new Date()
  });

  // 3. Pusher (external clients - web/mobile)
  await this.pusherService.trigger(`shipment-${shipment.awb}`, 'status-changed', {
    status: newStatus,
    timestamp: new Date()
  });
}
```

### Location Updates

```typescript
async emitLocationUpdate(riderId, location, shipmentAwb?) {
  // 1. Cache latest location (5-minute TTL)
  await this.cacheService.set(
    `rider:location:latest:${riderId}`,
    location,
    300
  );

  // 2. Publish to Redis (internal)
  await this.cacheService.publish(`rider:location:${riderId}`, location);
  
  if (shipmentAwb) {
    await this.cacheService.publish(`tracking:${shipmentAwb}:location`, {
      riderId,
      location
    });
  }

  // 3. Pusher (external)
  await this.pusherService.trigger(`rider-${riderId}`, 'location', location);
}
```

## Environment Variables

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# SLA Configuration
EXPRESS_SLA_HOURS=24
NORMAL_SLA_HOURS=72
```

## Testing

### 1. Verify Redis Connection

```bash
# Check if Redis is running
redis-cli ping
# Expected: PONG

# Monitor Redis commands
redis-cli monitor

# Check keys
redis-cli keys "*"
```

### 2. Test Cache Operations

```bash
# Set a test key
redis-cli SET test:key "Hello Redis"

# Get the key
redis-cli GET test:key

# Check TTL
redis-cli TTL test:key

# Delete key
redis-cli DEL test:key
```

### 3. Test Pub/Sub

**Terminal 1 - Subscribe:**
```bash
redis-cli SUBSCRIBE tracking:* rider:location:* sla-violations
```

**Terminal 2 - Publish:**
```bash
redis-cli PUBLISH tracking:AWB123 '{"status": "DELIVERED"}'
redis-cli PUBLISH sla-violations '{"type": "delivery", "shipmentId": "123"}'
```

### 4. Monitor Bull Queues

```bash
# Check queue status via API
curl -X GET http://localhost:3001/api/sla/queue/status \
  -H "Authorization: Bearer {admin_token}"

# Or use Redis CLI
redis-cli LLEN bull:sla-watcher:waiting
redis-cli LLEN bull:sla-watcher:active
redis-cli LLEN bull:sla-watcher:completed
redis-cli LLEN bull:sla-watcher:failed
```

## Performance Optimization

### Cache TTL Strategy

- **High-frequency data** (tracking): 2-5 minutes
- **Medium-frequency data** (rider locations): 5-10 minutes
- **Low-frequency data** (user profiles): 1 hour
- **Static data** (configuration): 24 hours

### Cache Invalidation

Always invalidate cache when data changes:

```typescript
// After status update
await this.cacheService.del(`tracking:public:${awb}`);
await this.cacheService.del(`tracking:detailed:${awb}`);

// Pattern-based invalidation
await this.cacheService.delPattern(`rider:${riderId}:*`);
```

### Pub/Sub Best Practices

1. **Keep messages small** - Only send necessary data
2. **Use structured channels** - `entity:identifier:action`
3. **JSON serialization** - Automatic in our implementation
4. **Error handling** - All subscribers have try/catch

## Troubleshooting

### Redis Connection Issues

```typescript
// Check connection
const ping = await cacheService.ping();
console.log('Redis PING:', ping); // Should return 'PONG'
```

### Cache Miss Rate

```typescript
// Monitor cache hits/misses
const stats = {
  hits: await cacheService.get('stats:cache:hits') || 0,
  misses: await cacheService.get('stats:cache:misses') || 0
};
console.log('Cache hit rate:', (stats.hits / (stats.hits + stats.misses)) * 100);
```

### SLA Watcher Not Running

Check logs for:
```
[SlaWatcherService] Starting SLA violation check...
[SlaWatcherService] Checked X shipments for pickup SLA violations
[SlaWatcherService] Checked X shipments for delivery SLA violations
[SlaWatcherService] Checked X shipments for in-transit SLA violations
[SlaWatcherService] SLA violation check completed
```

If not appearing, verify:
1. `@nestjs/schedule` is installed
2. `ScheduleModule.forRoot()` in SlaWatcherModule
3. Cron expression is valid

## Monitoring & Alerting

### Key Metrics to Monitor

1. **Cache Hit Rate** - Should be > 70%
2. **Redis Memory Usage** - Set max memory limit
3. **SLA Violations** - Track trends
4. **Queue Backlog** - Should stay low
5. **Pub/Sub Message Rate** - Monitor for spikes

### Redis INFO

```bash
# Get Redis statistics
redis-cli INFO stats
redis-cli INFO memory
redis-cli INFO persistence
```

## Security

### Redis Configuration

```conf
# redis.conf
requirepass your_strong_password
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### Access Control

- Use strong password in production
- Bind to localhost if not using remote Redis
- Use TLS for remote connections
- Implement key namespacing by tenant

## Production Deployment

### Redis Cluster

For high availability:
```typescript
const redisClient = new Redis.Cluster([
  { host: 'redis-node-1', port: 6379 },
  { host: 'redis-node-2', port: 6379 },
  { host: 'redis-node-3', port: 6379 },
]);
```

### Persistence

Configure Redis persistence:
```conf
# Enable both AOF and RDB
appendonly yes
appendfsync everysec
save 900 1
save 300 10
save 60 10000
```

### Monitoring Tools

- **Redis Commander** - Web UI for Redis
- **RedisInsight** - Official Redis GUI
- **Prometheus + Grafana** - Metrics and dashboards

## Summary

This Redis infrastructure provides:
- ✅ **Performance** - Cache-first strategy reduces DB load
- ✅ **Real-time** - Pub/sub enables live updates
- ✅ **Automation** - SLA monitoring with cron jobs
- ✅ **Scalability** - Bull queues for background processing
- ✅ **Reliability** - Dual broadcasting (Redis + Pusher)
- ✅ **Observability** - Comprehensive monitoring endpoints

Total System Stats:
- **Modules**: 12 (10 business + CacheModule + SlaWatcherModule)
- **REST Endpoints**: 102 (99 business + 3 SLA monitoring)
- **Bull Queues**: 2 (notifications, sla-watcher)
- **Background Jobs**: 7 types
- **Pub/Sub Channels**: 6+ categories
- **Cache Keys**: 10+ patterns
