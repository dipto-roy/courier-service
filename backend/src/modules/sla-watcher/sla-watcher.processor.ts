import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';

@Processor('sla-watcher')
export class SlaWatcherProcessor {
  private readonly logger = new Logger(SlaWatcherProcessor.name);

  constructor(private auditService: AuditService) {}

  @Process('pickup-sla-violation')
  async handlePickupSLAViolation(job: Job) {
    const { shipmentId, awb, merchantId, violationType, slaHours } = job.data;

    this.logger.warn(`Processing pickup SLA violation for shipment ${awb}`);

    try {
      // Log to audit
      await this.auditService.logShipmentAction(
        'system',
        shipmentId,
        'sla_violation',
        `Pickup SLA of ${slaHours} hours exceeded for shipment ${awb}`,
        null,
        { violationType, slaHours },
        'system',
        'SLA Watcher',
      );

      // Additional actions can be added here:
      // - Create ticket in support system
      // - Escalate to operations team
      // - Update merchant dashboard
      
      return { success: true, shipmentId, awb };
    } catch (error) {
      this.logger.error(`Error processing pickup SLA violation for ${awb}:`, error.message);
      throw error;
    }
  }

  @Process('delivery-sla-violation')
  async handleDeliverySLAViolation(job: Job) {
    const { shipmentId, awb, merchantId, riderId, status, violationType, slaHours } = job.data;

    this.logger.warn(`Processing delivery SLA violation for shipment ${awb}`);

    try {
      // Log to audit
      await this.auditService.logShipmentAction(
        'system',
        shipmentId,
        'sla_violation',
        `Delivery SLA of ${slaHours} hours exceeded for shipment ${awb}. Current status: ${status}`,
        null,
        { violationType, slaHours, status, riderId },
        'system',
        'SLA Watcher',
      );

      // Additional actions:
      // - Auto-escalate to supervisor
      // - Create high-priority ticket
      // - Send alert to operations dashboard
      
      return { success: true, shipmentId, awb };
    } catch (error) {
      this.logger.error(`Error processing delivery SLA violation for ${awb}:`, error.message);
      throw error;
    }
  }

  @Process('intransit-sla-violation')
  async handleInTransitSLAViolation(job: Job) {
    const { shipmentId, awb, merchantId, violationType, lastUpdate, slaHours } = job.data;

    this.logger.warn(`Processing in-transit SLA violation for shipment ${awb}`);

    try {
      // Log to audit
      await this.auditService.logShipmentAction(
        'system',
        shipmentId,
        'sla_violation',
        `In-transit update SLA of ${slaHours} hours exceeded for shipment ${awb}. Last update: ${lastUpdate}`,
        null,
        { violationType, slaHours, lastUpdate },
        'system',
        'SLA Watcher',
      );

      // Additional actions:
      // - Request status update from hub
      // - Check GPS tracking
      // - Alert operations team
      
      return { success: true, shipmentId, awb };
    } catch (error) {
      this.logger.error(`Error processing in-transit SLA violation for ${awb}:`, error.message);
      throw error;
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Completed job ${job.id} of type ${job.name}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Failed job ${job.id} of type ${job.name}: ${error.message}`);
  }
}
