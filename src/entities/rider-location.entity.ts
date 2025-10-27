import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('rider_locations')
@Index(['riderId', 'createdAt'])
@Index(['shipmentId'])
export class RiderLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'rider_id' })
  riderId: string;

  @Column({ name: 'shipment_id', nullable: true })
  shipmentId: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ nullable: true })
  accuracy: number;

  @Column({ nullable: true })
  speed: number;

  @Column({ nullable: true })
  heading: number;

  @Column({ name: 'battery_level', nullable: true })
  batteryLevel: number;

  @Column({ name: 'is_online', default: true })
  isOnline: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.riderLocations)
  @JoinColumn({ name: 'rider_id' })
  rider: User;
}
