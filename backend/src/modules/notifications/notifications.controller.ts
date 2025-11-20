import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto, SendEmailDto, SendSmsDto, SendPushNotificationDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ==================== General Notification Endpoints ====================

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Send a notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification sent successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        type: 'email',
        title: 'Shipment Update',
        message: 'Your shipment has been delivered',
        isRead: false,
        createdAt: '2025-10-28T10:00:00Z',
      },
    },
  })
  async sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
    return this.notificationsService.sendNotification(sendNotificationDto);
  }

  @Post('email')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Send an email notification' })
  @ApiResponse({
    status: 201,
    description: 'Email queued successfully',
    schema: { example: { success: true, message: 'Email queued for delivery' } },
  })
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    await this.notificationsService.sendEmail(sendEmailDto);
    return { success: true, message: 'Email queued for delivery' };
  }

  @Post('sms')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Send an SMS notification' })
  @ApiResponse({
    status: 201,
    description: 'SMS queued successfully',
    schema: { example: { success: true, message: 'SMS queued for delivery' } },
  })
  async sendSms(@Body() sendSmsDto: SendSmsDto) {
    await this.notificationsService.sendSms(sendSmsDto);
    return { success: true, message: 'SMS queued for delivery' };
  }

  @Post('push')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Send a push notification' })
  @ApiResponse({
    status: 201,
    description: 'Push notification queued successfully',
    schema: { example: { success: true, message: 'Push notification queued for delivery' } },
  })
  async sendPushNotification(@Body() sendPushDto: SendPushNotificationDto) {
    await this.notificationsService.sendPushNotification(sendPushDto);
    return { success: true, message: 'Push notification queued for delivery' };
  }

  // ==================== User Notification Management ====================

  @Get('my-notifications')
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean, description: 'Filter by read status' })
  @ApiResponse({
    status: 200,
    description: 'User notifications retrieved',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'push',
          title: 'Shipment Update',
          message: 'Your shipment is out for delivery',
          isRead: false,
          createdAt: '2025-10-28T10:00:00Z',
        },
      ],
    },
  })
  async getMyNotifications(@Request() req, @Query('isRead') isRead?: string) {
    const isReadBoolean = isRead !== undefined ? isRead === 'true' : undefined;
    return this.notificationsService.getUserNotifications(req.user.userId, isReadBoolean);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved',
    schema: { example: { count: 5 } },
  })
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.userId);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        isRead: true,
        readAt: '2025-10-28T10:30:00Z',
      },
    },
  })
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
    schema: { example: { success: true, message: 'All notifications marked as read' } },
  })
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.userId);
    return { success: true, message: 'All notifications marked as read' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted',
    schema: { example: { success: true, message: 'Notification deleted' } },
  })
  async deleteNotification(@Param('id') id: string, @Request() req) {
    await this.notificationsService.deleteNotification(id, req.user.userId);
    return { success: true, message: 'Notification deleted' };
  }

  // ==================== Admin Endpoints ====================

  @Get('users/:userId')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Get notifications for a specific user (Admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User notifications retrieved',
  })
  async getUserNotifications(@Param('userId') userId: string) {
    return this.notificationsService.getUserNotifications(userId);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Get notification statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Notification statistics',
    schema: {
      example: {
        total: 1000,
        sent: 950,
        failed: 50,
        unread: 0,
        byType: {
          email: 400,
          sms: 350,
          push: 250,
        },
      },
    },
  })
  async getStatistics() {
    return this.notificationsService.getNotificationStats();
  }

  @Get('statistics/user/:userId')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Get notification statistics for a user (Admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User notification statistics',
  })
  async getUserStatistics(@Param('userId') userId: string) {
    return this.notificationsService.getNotificationStats(userId);
  }

  // ==================== Shipment Notification Triggers ====================

  @Post('shipment/created')
  @Roles(UserRole.ADMIN, UserRole.MERCHANT, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Trigger shipment created notifications' })
  @ApiResponse({
    status: 201,
    description: 'Notifications sent',
    schema: { example: { success: true } },
  })
  async notifyShipmentCreated(
    @Body() body: { userId: string; shipmentId: string; awb: string; data: any },
  ) {
    await this.notificationsService.notifyShipmentCreated(
      body.userId,
      body.shipmentId,
      body.awb,
      body.data,
    );
    return { success: true };
  }

  @Post('shipment/picked-up')
  @Roles(UserRole.ADMIN, UserRole.HUB_STAFF, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Trigger shipment picked up notifications' })
  @ApiResponse({
    status: 201,
    description: 'Notifications sent',
  })
  async notifyShipmentPickedUp(
    @Body() body: { userId: string; shipmentId: string; awb: string; data: any },
  ) {
    await this.notificationsService.notifyShipmentPickedUp(
      body.userId,
      body.shipmentId,
      body.awb,
      body.data,
    );
    return { success: true };
  }

  @Post('shipment/out-for-delivery')
  @Roles(UserRole.ADMIN, UserRole.RIDER, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Trigger out for delivery notifications' })
  @ApiResponse({
    status: 201,
    description: 'Notifications sent',
  })
  async notifyOutForDelivery(
    @Body()
    body: {
      userId: string;
      shipmentId: string;
      awb: string;
      riderName: string;
      riderPhone: string;
    },
  ) {
    await this.notificationsService.notifyOutForDelivery(
      body.userId,
      body.shipmentId,
      body.awb,
      body.riderName,
      body.riderPhone,
    );
    return { success: true };
  }

  @Post('shipment/delivered')
  @Roles(UserRole.ADMIN, UserRole.RIDER, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Trigger shipment delivered notifications' })
  @ApiResponse({
    status: 201,
    description: 'Notifications sent',
  })
  async notifyDelivered(
    @Body() body: { userId: string; shipmentId: string; awb: string; deliveredAt: string },
  ) {
    await this.notificationsService.notifyDelivered(
      body.userId,
      body.shipmentId,
      body.awb,
      body.deliveredAt,
    );
    return { success: true };
  }

  @Post('shipment/failed')
  @Roles(UserRole.ADMIN, UserRole.RIDER, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Trigger delivery failed notifications' })
  @ApiResponse({
    status: 201,
    description: 'Notifications sent',
  })
  async notifyDeliveryFailed(
    @Body() body: { userId: string; shipmentId: string; awb: string; reason: string },
  ) {
    await this.notificationsService.notifyDeliveryFailed(
      body.userId,
      body.shipmentId,
      body.awb,
      body.reason,
    );
    return { success: true };
  }

  // ==================== Rider Notification Triggers ====================

  @Post('rider/pickup-assignment')
  @Roles(UserRole.ADMIN, UserRole.HUB_STAFF, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Notify rider of pickup assignment' })
  @ApiResponse({
    status: 201,
    description: 'Notification sent',
  })
  async notifyPickupAssignment(
    @Body() body: { riderId: string; pickupId: string; address: string; itemCount: number },
  ) {
    await this.notificationsService.notifyPickupAssignment(
      body.riderId,
      body.pickupId,
      body.address,
      body.itemCount,
    );
    return { success: true };
  }

  @Post('rider/manifest-assignment')
  @Roles(UserRole.ADMIN, UserRole.HUB_STAFF, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Notify rider of manifest assignment' })
  @ApiResponse({
    status: 201,
    description: 'Notification sent',
  })
  async notifyManifestAssignment(
    @Body() body: { riderId: string; manifestId: string; shipmentCount: number },
  ) {
    await this.notificationsService.notifyManifestAssignment(
      body.riderId,
      body.manifestId,
      body.shipmentCount,
    );
    return { success: true };
  }

  // ==================== Payment Notification Triggers ====================

  @Post('payment/payout-initiated')
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @ApiOperation({ summary: 'Notify payout initiated' })
  @ApiResponse({
    status: 201,
    description: 'Notification sent',
  })
  async notifyPayoutInitiated(
    @Body() body: { userId: string; amount: number; transactionId: string },
  ) {
    await this.notificationsService.notifyPayoutInitiated(
      body.userId,
      body.amount,
      body.transactionId,
    );
    return { success: true };
  }

  @Post('payment/payout-completed')
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @ApiOperation({ summary: 'Notify payout completed' })
  @ApiResponse({
    status: 201,
    description: 'Notification sent',
  })
  async notifyPayoutCompleted(
    @Body() body: { userId: string; amount: number; transactionId: string; referenceNumber: string },
  ) {
    await this.notificationsService.notifyPayoutCompleted(
      body.userId,
      body.amount,
      body.transactionId,
      body.referenceNumber,
    );
    return { success: true };
  }
}
