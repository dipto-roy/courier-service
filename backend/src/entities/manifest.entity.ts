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

export enum ManifestStatus {
  CREATED = 'created',
  IN_TRANSIT = 'in_transit',
  RECEIVED = 'received',
  CLOSED = 'closed',
}

@Entity('manifests')
@Index(['manifestNumber'], { unique: true })
@Index(['status'])
@Index(['createdById'])
export class Manifest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'manifest_number', unique: true, length: 20 })
  manifestNumber: string;

  @Column({ name: 'origin_hub' })
  originHub: string;

  @Column({ name: 'destination_hub', nullable: true })
  destinationHub: string;

  @Column({ name: 'rider_id', nullable: true })
  riderId: string;

  @Column({
    type: 'enum',
    enum: ManifestStatus,
    default: ManifestStatus.CREATED,
  })
  status: ManifestStatus;

  @Column({ name: 'total_shipments', type: 'int', default: 0 })
  totalShipments: number;

  @Column({ name: 'dispatch_date', type: 'timestamp', nullable: true })
  dispatchDate: Date;

  @Column({ name: 'received_date', type: 'timestamp', nullable: true })
  receivedDate: Date;

  @Column({ name: 'created_by_id' })
  createdById: string;

  @Column({ name: 'received_by_id', nullable: true })
  receivedById: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'received_by_id' })
  receivedBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'rider_id' })
  rider: User;

  @OneToMany(() => Shipment, (shipment) => shipment.manifest)
  shipments: Shipment[];
}
