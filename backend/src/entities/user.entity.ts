import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../common/enums';
import { Shipment } from './shipment.entity';
import { Pickup } from './pickup.entity';
import { RiderLocation } from './rider-location.entity';
import { Transaction } from './transaction.entity';

@Entity('users')
@Index(['email'])
@Index(['phone'])
@Index(['role'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_kyc_verified', default: false })
  isKycVerified: boolean;

  @Column({ name: 'two_fa_enabled', default: false })
  twoFaEnabled: boolean;

  @Column({ name: 'two_fa_secret', nullable: true })
  @Exclude()
  twoFaSecret: string;

  @Column({ name: 'otp_code', type: 'varchar', nullable: true })
  @Exclude()
  otpCode: string | null;

  @Column({ name: 'otp_expiry', type: 'timestamp', nullable: true })
  otpExpiry: Date | null;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  @Exclude()
  refreshToken: string | null;

  @Column({
    name: 'wallet_balance',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  walletBalance: number;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  area: string;

  @Column({ name: 'postal_code', nullable: true })
  postalCode: string;

  @Column({ nullable: true })
  latitude: string;

  @Column({ nullable: true })
  longitude: string;

  @Column({ name: 'hub_id', nullable: true })
  hubId: string;

  @Column({ name: 'merchant_business_name', nullable: true })
  merchantBusinessName: string;

  @Column({ name: 'merchant_trade_license', nullable: true })
  merchantTradeLicense: string;

  @Column({ name: 'profile_image', nullable: true })
  profileImage: string;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // Relations
  @OneToMany(() => Shipment, (shipment) => shipment.merchant)
  shipments: Shipment[];

  @OneToMany(() => Pickup, (pickup) => pickup.agent)
  pickups: Pickup[];

  @OneToMany(() => RiderLocation, (location) => location.rider)
  riderLocations: RiderLocation[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];
}
