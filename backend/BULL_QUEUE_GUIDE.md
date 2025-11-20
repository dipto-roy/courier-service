# 🐂 Bull Queue Guide - FastX Courier Service

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Configuration](#configuration)
4. [Queue Types](#queue-types)
5. [How It Works](#how-it-works)
6. [Usage Examples](#usage-examples)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Overview

**Bull** is a Redis-based queue system for handling distributed jobs and messages in Node.js. Your FastX Courier Service uses Bull for **asynchronous background processing**.

### Why Bull Queue?

✅ **Async Processing** - Don't block API responses  
✅ **Reliability** - Jobs persist in Redis, survive crashes  
✅ **Retry Logic** - Automatic retry on failures  
✅ **Scalability** - Distribute work across multiple workers  
✅ **Priority Queues** - Process important jobs first  
✅ **Job Scheduling** - Delayed and repeated jobs  

---

## Architecture

```
┌─────────────┐
│   Client    │ (API Request)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Controller  │ (Receives request)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Service    │ (Adds job to queue)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Bull Queue  │ (Redis - Stores jobs)
│   (Redis)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Processor  │ (Background worker - Processes jobs)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Result    │ (Job completed/failed)
└─────────────┘
```

---

## Configuration

### 1. Global Bull Configuration

Location: `src/app.module.ts`

```typescript
BullModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    redis: {
      host: configService.get('REDIS_HOST') || 'localhost',
      port: configService.get('REDIS_PORT') || 6379,
      password: configService.get('REDIS_PASSWORD'), // Optional
    },
  }),
  inject: [ConfigService],
})
```

### 2. Environment Variables

Location: `.env`

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=         # Optional, leave empty if no password
REDIS_DB=0
```

### 3. Queue Registration

Each module registers its own queue:

```typescript
// In notifications.module.ts
BullModule.registerQueue({
  name: 'notifications',  // Queue name
})

// In sla-watcher.module.ts
BullModule.registerQueue({
  name: 'sla-watcher',   // Queue name
})
```

---

## Queue Types

Your system has **2 main queues**:

### 1. 📧 Notifications Queue (`notifications`)

**Purpose**: Handle all notification delivery asynchronously

**Job Types**:
- `send-notification` - Generic notification with database record
- `send-email` - Direct email sending
- `send-sms` - Direct SMS sending
- `send-push` - Direct push notification sending

**Location**: `src/modules/notifications/`

### 2. ⏰ SLA Watcher Queue (`sla-watcher`)

**Purpose**: Monitor and process SLA violations

**Job Types**:
- `pickup-sla-violation` - Pickup not completed within SLA
- `delivery-sla-violation` - Delivery not completed within SLA
- `intransit-sla-violation` - Shipment stuck in transit

**Location**: `src/modules/sla-watcher/`

---

## How It Works

### Step-by-Step Flow

#### Example: Sending a Notification

**Step 1: API Request**
```bash
POST /api/notifications/push
{
  "userId": "user-123",
  "title": "Shipment Delivered",
  "body": "Your package has arrived!"
}
```

**Step 2: Controller** (`notifications.controller.ts`)
```typescript
@Post('push')
async sendPushNotification(@Body() sendPushDto: SendPushNotificationDto) {
  // Just queue the job, don't wait for completion
  await this.notificationsService.sendPushNotification(sendPushDto);
  
  // Return immediately
  return { success: true, message: 'Push notification queued for delivery' };
}
```

**Step 3: Service** (`notifications.service.ts`)
```typescript
async sendPushNotification(pushDto: SendPushNotificationDto): Promise<boolean> {
  try {
    // Add job to Bull Queue
    await this.notificationQueue.add('send-push', pushDto);
    return true;
  } catch (error) {
    this.logger.error('Failed to queue push notification:', error.message);
    throw error;
  }
}
```

**Step 4: Bull Queue** (Redis)
```
Job added to Redis:
bull:notifications:send-push:123
Status: waiting
Data: { userId, title, body }
```

**Step 5: Processor** (`notifications.processor.ts`)
```typescript
@Processor('notifications')
export class NotificationsProcessor {
  
  @Process('send-push')
  async handleSendPush(job: Job<SendPushNotificationDto>) {
    this.logger.log(`Processing push notification job ${job.id}`);
    
    try {
      // Actually send the notification
      await this.pushService.sendPushNotification(job.data);
      
      this.logger.log(`Push job ${job.id} completed`);
    } catch (error) {
      this.logger.error(`Push job ${job.id} failed:`, error.message);
      throw error; // Bull will retry automatically
    }
  }
}
```

**Step 6: Result**
```
Job completed:
bull:notifications:send-push:123
Status: completed
Result: { success: true }
```

---

## Usage Examples

### Example 1: Sending Notification from Service

```typescript
// In shipments.service.ts
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export class ShipmentsService {
  constructor(
    @InjectQueue('notifications')
    private notificationQueue: Queue,
  ) {}

  async updateShipmentStatus(id: string, status: string) {
    // Update shipment in database
    const shipment = await this.shipmentsRepository.update(id, { status });
    
    // Queue notification (don't wait)
    await this.notificationQueue.add('send-notification', {
      userId: shipment.customerId,
      type: 'push',
      title: 'Shipment Update',
      message: `Your shipment is now ${status}`,
      shipmentId: id,
    });
    
    return shipment;
  }
}
```

### Example 2: Processing with Retry

```typescript
@Process('send-email')
async handleSendEmail(job: Job<SendEmailDto>) {
  try {
    await this.emailService.sendEmail(job.data);
  } catch (error) {
    // If job fails, Bull will automatically retry
    // Default: 3 retries with exponential backoff
    throw error;
  }
}
```

### Example 3: Job with Delay

```typescript
// Send notification after 1 hour
await this.notificationQueue.add(
  'send-reminder',
  { userId, message },
  { delay: 3600000 } // 1 hour in milliseconds
);
```

### Example 4: Priority Jobs

```typescript
// High priority notification
await this.notificationQueue.add(
  'send-critical-alert',
  { userId, message },
  { priority: 1 } // Lower number = higher priority
);
```

### Example 5: Scheduled Jobs (Cron)

```typescript
// In sla-watcher.service.ts
import { Cron, CronExpression } from '@nestjs/schedule';

@Cron(CronExpression.EVERY_HOUR)
async checkSLAViolations() {
  // This runs every hour automatically
  const violations = await this.findViolations();
  
  // Queue jobs for each violation
  for (const violation of violations) {
    await this.slaQueue.add('pickup-sla-violation', violation);
  }
}
```

---

## Monitoring

### 1. Check Queue Status via API

```bash
# SLA Watcher queue status
GET http://localhost:3001/api/sla/queue/status
Authorization: Bearer {admin_token}

Response:
{
  "waiting": 5,      # Jobs waiting to be processed
  "active": 2,       # Jobs currently being processed
  "completed": 145,  # Successfully completed jobs
  "failed": 3,       # Failed jobs
  "total": 155
}
```

### 2. Redis CLI Commands

```bash
# Connect to Redis
redis-cli

# Check notification queue
LLEN bull:notifications:waiting
LLEN bull:notifications:active
LLEN bull:notifications:completed
LLEN bull:notifications:failed

# Check SLA watcher queue
LLEN bull:sla-watcher:waiting
LLEN bull:sla-watcher:active

# Get all queue keys
KEYS bull:*

# View specific job
GET bull:notifications:123
```

### 3. Bull Board (Optional - Web UI)

Install Bull Board for a web-based dashboard:

```bash
npm install @bull-board/express @bull-board/api
```

```typescript
// In main.ts
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';

const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [
    new BullAdapter(notificationQueue),
    new BullAdapter(slaQueue),
  ],
  serverAdapter,
});

serverAdapter.setBasePath('/admin/queues');
app.use('/admin/queues', serverAdapter.getRouter());
```

Access at: `http://localhost:3001/admin/queues`

---

## Job Lifecycle

```
┌─────────────┐
│   Created   │ (Job added to queue)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Waiting   │ (In queue, waiting for processor)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Active    │ (Being processed by worker)
└──────┬──────┘
       │
       ├─────────────┐
       ▼             ▼
┌─────────────┐  ┌─────────────┐
│  Completed  │  │   Failed    │
└─────────────┘  └──────┬──────┘
                        │
                        ▼
                 ┌─────────────┐
                 │   Retry     │ (Auto retry with backoff)
                 └──────┬──────┘
                        │
                        └──────► Back to Waiting
```

---

## Configuration Options

### Job Options

```typescript
await queue.add('job-name', data, {
  // Retry configuration
  attempts: 3,                    // Number of retry attempts
  backoff: {
    type: 'exponential',          // exponential or fixed
    delay: 2000,                  // Initial delay in ms
  },
  
  // Timing
  delay: 5000,                    // Delay before processing (ms)
  timeout: 30000,                 // Job timeout (ms)
  
  // Priority
  priority: 1,                    // Lower number = higher priority
  
  // Job removal
  removeOnComplete: true,         // Remove after completion
  removeOnFail: false,            // Keep failed jobs for debugging
  
  // Job ID
  jobId: 'unique-job-123',        // Custom job ID
});
```

### Queue Options

```typescript
BullModule.registerQueue({
  name: 'notifications',
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,        // Keep last 100 completed
    removeOnFail: 1000,           // Keep last 1000 failed
  },
})
```

---

## Troubleshooting

### Problem 1: Jobs Not Processing

**Symptoms**: Jobs stuck in "waiting" state

**Check**:
```bash
# Is Redis running?
redis-cli ping
# Should return: PONG

# Is processor registered?
# Check logs for: "Processor 'notifications' registered"
```

**Fix**:
```bash
# Restart Redis
sudo systemctl restart redis

# Restart your application
npm run start:dev
```

### Problem 2: Jobs Failing

**Check logs**:
```bash
# Your application logs will show:
[NotificationsProcessor] Push job 123 failed: Connection timeout
```

**Check Redis**:
```bash
redis-cli
LRANGE bull:notifications:failed 0 10
```

**Fix**: Check the error message and fix the underlying issue (email config, SMS gateway, etc.)

### Problem 3: Queue Growing Too Large

**Check queue size**:
```bash
redis-cli LLEN bull:notifications:waiting
# If > 10000, you have a backlog
```

**Solutions**:
1. Scale up processing: Add more workers
2. Increase processor speed: Optimize service code
3. Clean old jobs: `queue.clean()`

### Problem 4: Memory Issues

**Check Redis memory**:
```bash
redis-cli INFO memory
```

**Configure Redis eviction**:
```bash
# In redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

---

## Best Practices

### ✅ DO

1. **Keep jobs small and focused**
   ```typescript
   // Good
   await queue.add('send-email', { to, subject, body });
   
   // Bad - too much data
   await queue.add('process-order', { fullOrderWithAllDetails });
   ```

2. **Use job IDs for idempotency**
   ```typescript
   await queue.add('payment', data, { 
     jobId: `payment-${orderId}` // Prevents duplicates
   });
   ```

3. **Handle errors gracefully**
   ```typescript
   try {
     await externalService.call();
   } catch (error) {
     logger.error(`Job failed: ${error.message}`);
     throw error; // Let Bull retry
   }
   ```

4. **Log job progress**
   ```typescript
   @Process('long-task')
   async handleLongTask(job: Job) {
     this.logger.log(`Starting job ${job.id}`);
     await job.progress(20);  // Report progress
     // ... work
     await job.progress(100);
     this.logger.log(`Completed job ${job.id}`);
   }
   ```

### ❌ DON'T

1. **Don't wait for jobs in API responses**
   ```typescript
   // Bad
   const job = await queue.add('send-email', data);
   await job.finished(); // Blocks response!
   
   // Good
   await queue.add('send-email', data);
   return { success: true }; // Return immediately
   ```

2. **Don't store large data in jobs**
   ```typescript
   // Bad
   await queue.add('process', { 
     hugeFile: Buffer.from(...) // 100MB file
   });
   
   // Good
   await queue.add('process', { 
     fileId: '123' // Just reference
   });
   ```

3. **Don't forget error handling**
   ```typescript
   // Bad
   @Process('risky-task')
   async handle(job: Job) {
     await riskyOperation(); // No error handling
   }
   
   // Good
   @Process('risky-task')
   async handle(job: Job) {
     try {
       await riskyOperation();
     } catch (error) {
       this.logger.error(`Failed: ${error.message}`);
       throw error;
     }
   }
   ```

---

## Summary

### Current Implementation

Your FastX Courier Service has:

✅ **2 Active Queues**:
- `notifications` - 4 job types (notification, email, SMS, push)
- `sla-watcher` - 3 job types (pickup, delivery, intransit violations)

✅ **Background Workers**:
- NotificationsProcessor - Handles all notification deliveries
- SlaWatcherProcessor - Processes SLA violations

✅ **Scheduled Jobs**:
- SLA monitoring runs every hour via cron
- Automatic violation detection and alerting

✅ **Monitoring**:
- API endpoint: `/api/sla/queue/status`
- Redis CLI commands
- Application logs

### Key Benefits

🚀 **Performance** - API responses return immediately  
🔄 **Reliability** - Jobs persist through server restarts  
♻️ **Retry Logic** - Automatic retry on failures  
📊 **Scalability** - Easy to add more workers  
⏰ **Scheduling** - Cron jobs for recurring tasks  

---

## Quick Reference

```bash
# Start Redis
redis-cli ping

# Check queue status
curl http://localhost:3001/api/sla/queue/status -H "Authorization: Bearer TOKEN"

# View queue in Redis
redis-cli
LLEN bull:notifications:waiting

# Monitor logs
tail -f logs/app.log | grep "Processor"

# Restart application
npm run start:dev
```

---

**Need Help?**
- Documentation: https://docs.bullmq.io/
- Your implementation: `src/modules/notifications/` and `src/modules/sla-watcher/`
- Redis commands: https://redis.io/commands
