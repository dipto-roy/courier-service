import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PaymentMethod, PaymentStatus } from '../common/enums';
import { User } from './user.entity';

export enum TransactionType {
  DELIVERY_FEE = 'delivery_fee',
  COD_COLLECTION = 'cod_collection',
  COD_PAYOUT = 'cod_payout',
  WALLET_CREDIT = 'wallet_credit',
  WALLET_DEBIT = 'wallet_debit',
  REFUND = 'refund',
}

@Entity('transactions')
@Index(['userId'])
@Index(['shipmentId'])
@Index(['type'])
@Index(['status'])
@Index(['createdAt'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'transaction_id', unique: true, length: 30 })
  transactionId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'shipment_id', nullable: true })
  shipmentId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fee: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 10, scale: 2 })
  netAmount: number;

  @Column({
    name: 'previous_balance',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  previousBalance: number;

  @Column({
    name: 'new_balance',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  newBalance: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'reference_number', nullable: true })
  referenceNumber: string;

  @Column({ name: 'gateway_response', type: 'jsonb', nullable: true })
  gatewayResponse: any;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ name: 'processed_by_id', nullable: true })
  processedById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'processed_by_id' })
  processedBy: User;
}
