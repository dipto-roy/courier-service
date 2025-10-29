/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import {
  ShipmentStatus,
  DeliveryType,
  PaymentMethod,
  PaymentStatus,
} from '../common/enums';
import { User } from './user.entity';
import { Pickup } from './pickup.entity';
import { Manifest } from './manifest.entity';

@Entity('shipments')
@Index(['awb'], { unique: true })
@Index(['merchantId'])
@Index(['customerId'])
@Index(['status'])
@Index(['createdAt'])
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  awb: string; // Air Waybill number (unique tracking number)

  @Column({ name: 'merchant_id' })
  merchantId: string;

  @Column({ name: 'customer_id', nullable: true })
  customerId: string;

  @Column({ name: 'pickup_id', nullable: true })
  pickupId: string;

  @Column({ name: 'manifest_id', nullable: true })
  manifestId: string;

  @Column({ name: 'rider_id', nullable: true })
  riderId: string;

  // Sender Information
  @Column({ name: 'sender_name' })
  senderName: string;

  @Column({ name: 'sender_phone' })
  senderPhone: string;

  @Column({ name: 'sender_address', type: 'text' })
  senderAddress: string;

  @Column({ name: 'sender_city' })
  senderCity: string;

  @Column({ name: 'sender_area' })
  senderArea: string;

  @Column({ name: 'sender_postal_code', nullable: true })
  senderPostalCode: string;

  // Receiver Information
  @Column({ name: 'receiver_name' })
  receiverName: string;

  @Column({ name: 'receiver_phone' })
  receiverPhone: string;

  @Column({ name: 'receiver_address', type: 'text' })
  receiverAddress: string;

  @Column({ name: 'receiver_city' })
  receiverCity: string;

  @Column({ name: 'receiver_area' })
  receiverArea: string;

  @Column({ name: 'receiver_postal_code', nullable: true })
  receiverPostalCode: string;

  @Column({ name: 'receiver_latitude', nullable: true })
  receiverLatitude: string;

  @Column({ name: 'receiver_longitude', nullable: true })
  receiverLongitude: string;

  // Shipment Details
  @Column({ name: 'product_description', type: 'text' })
  productDescription: string;

  @Column({ name: 'weight', type: 'decimal', precision: 8, scale: 2 })
  weight: number; // in kg

  @Column({ name: 'quantity', type: 'int', default: 1 })
  quantity: number;

  @Column({
    name: 'declared_value',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  declaredValue: number;

  @Column({
    type: 'enum',
    enum: DeliveryType,
    default: DeliveryType.NORMAL,
  })
  deliveryType: DeliveryType;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING,
  })
  status: ShipmentStatus;

  // Payment Information
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.COD,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({
    name: 'cod_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  codAmount: number;

  @Column({ name: 'delivery_fee', type: 'decimal', precision: 10, scale: 2 })
  deliveryFee: number;

  @Column({
    name: 'cod_fee',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  codFee: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  // Tracking & SLA
  @Column({ name: 'expected_delivery_date', type: 'timestamp', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ name: 'actual_delivery_date', type: 'timestamp', nullable: true })
  actualDeliveryDate: Date;

  @Column({ name: 'sla_breached', default: false })
  slaBreached: boolean;

  // Delivery Attempt Information
  @Column({ name: 'delivery_attempts', type: 'int', default: 0 })
  deliveryAttempts: number;

  @Column({ name: 'failed_reason', type: 'text', nullable: true })
  failedReason: string;

  @Column({ name: 'delivery_note', type: 'text', nullable: true })
  deliveryNote: string;

  @Column({ name: 'otp_code', nullable: true, length: 6 })
  otpCode: string;

  @Column({ name: 'signature_url', nullable: true })
  signatureUrl: string;

  @Column({ name: 'pod_photo_url', nullable: true })
  podPhotoUrl: string; // Proof of Delivery photo

  @Column({ name: 'pickup_photo_url', nullable: true })
  pickupPhotoUrl: string;

  // RTO Information
  @Column({ name: 'is_rto', default: false })
  isRto: boolean;

  @Column({ name: 'rto_reason', type: 'text', nullable: true })
  rtoReason: string;

  // Additional fields
  @Column({ name: 'current_hub', nullable: true })
  currentHub: string; // Current hub location

  @Column({ name: 'next_hub', nullable: true })
  nextHub: string; // Next hub for routing

  @Column({ name: 'delivery_area', nullable: true })
  deliveryArea: string; // Delivery area/zone

  @Column({ name: 'special_instructions', type: 'text', nullable: true })
  specialInstructions: string;

  @Column({ name: 'invoice_number', nullable: true })
  invoiceNumber: string;

  @Column({ name: 'reference_number', nullable: true })
  referenceNumber: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.shipments)
  @JoinColumn({ name: 'merchant_id' })
  merchant: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'rider_id' })
  rider: User;

  @ManyToOne(() => Pickup, (pickup) => pickup.shipments)
  @JoinColumn({ name: 'pickup_id' })
  pickup: Pickup;

  @ManyToOne(() => Manifest, (manifest) => manifest.shipments)
  @JoinColumn({ name: 'manifest_id' })
  manifest: Manifest;
}
