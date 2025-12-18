import { z } from 'zod';

// ==================== Enums ====================

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  PUSH = 'push',
}

// ==================== Interfaces ====================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  shipmentId?: string;
  data?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStatistics {
  total: number;
  sent: number;
  failed: number;
  unread: number;
  byType: {
    email: number;
    sms: number;
    push: number;
    whatsapp: number;
  };
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unread: number;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// ==================== Zod Schemas ====================

export const sendNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  shipmentId: z.string().uuid().optional(),
  data: z.record(z.string(), z.any()).optional(),
});

export const sendEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  html: z.string().optional(),
  text: z.string().optional(),
  template: z.string().optional(),
  context: z.record(z.string(), z.any()).optional(),
});

export const sendSmsSchema = z.object({
  to: z.string().min(10, 'Valid phone number required'),
  message: z.string().min(1, 'Message is required').max(160, 'SMS message too long'),
  template: z.string().optional(),
  context: z.record(z.string(), z.any()).optional(),
});

export const sendPushSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  data: z.record(z.string(), z.any()).optional(),
  channelId: z.string().optional(),
});

// ==================== Form Types ====================

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type SendSmsInput = z.infer<typeof sendSmsSchema>;
export type SendPushInput = z.infer<typeof sendPushSchema>;
