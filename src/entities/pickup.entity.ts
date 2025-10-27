import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Shipment } from './shipment.entity';

export enum PickupStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('pickups')
@Index(['agentId'])
@Index(['merchantId'])
@Index(['status'])
export class Pickup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id' })
  merchantId: string;

  @Column({ name: 'agent_id', nullable: true })
  agentId: string;

  @Column({
    type: 'enum',
    enum: PickupStatus,
    default: PickupStatus.PENDING,
  })
  status: PickupStatus;

  @Column({ name: 'pickup_address', type: 'text' })
  pickupAddress: string;

  @Column({ name: 'pickup_city' })
  pickupCity: string;

  @Column({ name: 'pickup_area' })
  pickupArea: string;

  @Column({ name: 'pickup_date', type: 'timestamp', nullable: true })
  pickupDate: Date;

  @Column({ name: 'scheduled_date', type: 'timestamp' })
  scheduledDate: Date;

  @Column({ name: 'contact_person' })
  contactPerson: string;

  @Column({ name: 'contact_phone' })
  contactPhone: string;

  @Column({ name: 'total_shipments', type: 'int', default: 0 })
  totalShipments: number;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'signature_url', nullable: true })
  signatureUrl: string;

  @Column({ name: 'photo_url', nullable: true })
  photoUrl: string;

  @Column({ name: 'latitude', nullable: true })
  latitude: string;

  @Column({ name: 'longitude', nullable: true })
  longitude: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.pickups)
  @JoinColumn({ name: 'agent_id' })
  agent: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'merchant_id' })
  merchant: User;

  @OneToMany(() => Shipment, (shipment) => shipment.pickup)
  shipments: Shipment[];
}
