import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Manifest, ManifestStatus } from '../../entities/manifest.entity';
import { Shipment } from '../../entities/shipment.entity';
import { User } from '../../entities/user.entity';
import { ShipmentStatus, UserRole } from '../../common/enums';
import {
  InboundScanDto,
  OutboundScanDto,
  CreateManifestDto,
  ReceiveManifestDto,
  FilterManifestDto,
  SortingDto,
} from './dto';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

@Injectable()
export class HubService {
  constructor(
    @InjectRepository(Manifest)
    private manifestRepository: Repository<Manifest>,
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Generate unique manifest number
   * Format: MF-YYYYMMDD-XXXX (MF-20250128-0001)
   */
  private async generateManifestNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const lastManifest = await this.manifestRepository
      .createQueryBuilder('manifest')
      .where('manifest.manifestNumber LIKE :pattern', {
        pattern: `MF-${dateStr}-%`,
      })
      .orderBy('manifest.manifestNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastManifest) {
      const lastSequence = parseInt(
        lastManifest.manifestNumber.split('-')[2],
        10,
      );
      sequence = lastSequence + 1;
    }

    return `MF-${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Inbound Scanning - Receive shipments at hub
   */
  async inboundScan(inboundScanDto: InboundScanDto, user: User) {
    const { awbNumbers, hubLocation, manifestId, notes } = inboundScanDto;

    // Validate all shipments exist
    const shipments = await this.shipmentRepository.find({
      where: { awb: In(awbNumbers) },
      relations: ['merchant'],
    });

    if (shipments.length !== awbNumbers.length) {
      const foundAwbs = shipments.map((s) => s.awb);
      const notFound = awbNumbers.filter((awb) => !foundAwbs.includes(awb));
      throw new BadRequestException(
        `Shipments not found: ${notFound.join(', ')}`,
      );
    }

    // Verify shipments are in correct status for inbound scan
    const invalidShipments = shipments.filter(
      (s) =>
        ![
          ShipmentStatus.PICKED_UP,
          ShipmentStatus.IN_TRANSIT,
          ShipmentStatus.IN_HUB,
        ].includes(s.status),
    );

    if (invalidShipments.length > 0) {
      throw new BadRequestException(
        `Invalid status for inbound scan: ${invalidShipments.map((s) => s.awb).join(', ')}`,
      );
    }

    // Update shipments
    const scannedShipments: Array<{
      awb: string;
      status: ShipmentStatus;
      currentHub: string;
    }> = [];
    for (const shipment of shipments) {
      shipment.status = ShipmentStatus.IN_HUB;
      shipment.currentHub = hubLocation;
      
      if (manifestId) {
        shipment.manifestId = manifestId;
      }

      await this.shipmentRepository.save(shipment);
      scannedShipments.push({
        awb: shipment.awb,
        status: shipment.status,
        currentHub: shipment.currentHub,
      });
    }

    // If scanning from manifest, update manifest status
    if (manifestId) {
      const manifest = await this.manifestRepository.findOne({
        where: { id: manifestId },
      });

      if (manifest && manifest.status === ManifestStatus.IN_TRANSIT) {
        manifest.status = ManifestStatus.RECEIVED;
        manifest.receivedDate = new Date();
        manifest.receivedById = user.id;
        if (notes) {
          manifest.notes = notes;
        }
        await this.manifestRepository.save(manifest);
      }
    }

    return {
      success: true,
      scannedCount: scannedShipments.length,
      hubLocation,
      scannedShipments,
      message: `Successfully scanned ${scannedShipments.length} shipments at ${hubLocation}`,
    };
  }

  /**
   * Outbound Scanning - Dispatch shipments from hub
   */
  async outboundScan(outboundScanDto: OutboundScanDto, user: User) {
    const { awbNumbers, originHub, destinationHub, riderId, notes } =
      outboundScanDto;

    // Validate all shipments exist
    const shipments = await this.shipmentRepository.find({
      where: { awb: In(awbNumbers) },
    });

    if (shipments.length !== awbNumbers.length) {
      const foundAwbs = shipments.map((s) => s.awb);
      const notFound = awbNumbers.filter((awb) => !foundAwbs.includes(awb));
      throw new BadRequestException(
        `Shipments not found: ${notFound.join(', ')}`,
      );
    }

    // Verify shipments are at the origin hub
    const invalidShipments = shipments.filter(
      (s) => s.currentHub !== originHub || s.status !== ShipmentStatus.IN_HUB,
    );

    if (invalidShipments.length > 0) {
      throw new BadRequestException(
        `Shipments not at ${originHub} or invalid status: ${invalidShipments.map((s) => s.awb).join(', ')}`,
      );
    }

    // If rider assigned, verify rider exists and has RIDER role
    if (riderId) {
      const rider = await this.userRepository.findOne({
        where: { id: riderId },
      });

      if (!rider) {
        throw new NotFoundException('Rider not found');
      }

      if (rider.role !== UserRole.RIDER) {
        throw new BadRequestException('User is not a rider');
      }
    }

    // Update shipments based on destination
    const scannedShipments: Array<{
      awb: string;
      status: ShipmentStatus;
      destination: string;
    }> = [];
    for (const shipment of shipments) {
      if (riderId) {
        // Assigned to rider for delivery
        shipment.status = ShipmentStatus.OUT_FOR_DELIVERY;
        shipment.riderId = riderId;
      } else if (destinationHub) {
        // Hub-to-hub transfer
        shipment.status = ShipmentStatus.IN_TRANSIT;
        shipment.nextHub = destinationHub;
      } else {
        // General outbound scan
        shipment.status = ShipmentStatus.IN_TRANSIT;
      }

      await this.shipmentRepository.save(shipment);
      scannedShipments.push({
        awb: shipment.awb,
        status: shipment.status,
        destination: destinationHub || 'Out for delivery',
      });
    }

    return {
      success: true,
      scannedCount: scannedShipments.length,
      originHub,
      destinationHub: destinationHub || (riderId ? 'Rider delivery' : null),
      scannedShipments,
      message: `Successfully dispatched ${scannedShipments.length} shipments from ${originHub}`,
    };
  }

  /**
   * Create Manifest for hub-to-hub transfer
   */
  async createManifest(createManifestDto: CreateManifestDto, user: User) {
    const { originHub, destinationHub, awbNumbers, riderId, notes } =
      createManifestDto;

    // Validate all shipments exist
    const shipments = await this.shipmentRepository.find({
      where: { awb: In(awbNumbers) },
    });

    if (shipments.length !== awbNumbers.length) {
      const foundAwbs = shipments.map((s) => s.awb);
      const notFound = awbNumbers.filter((awb) => !foundAwbs.includes(awb));
      throw new BadRequestException(
        `Shipments not found: ${notFound.join(', ')}`,
      );
    }

    // Verify all shipments are at origin hub
    const invalidShipments = shipments.filter(
      (s) => s.currentHub !== originHub || s.status !== ShipmentStatus.IN_HUB,
    );

    if (invalidShipments.length > 0) {
      throw new BadRequestException(
        `Some shipments are not at ${originHub}: ${invalidShipments.map((s) => s.awb).join(', ')}`,
      );
    }

    // If rider assigned, verify rider exists
    if (riderId) {
      const rider = await this.userRepository.findOne({
        where: { id: riderId, role: UserRole.RIDER },
      });

      if (!rider) {
        throw new NotFoundException('Rider not found or invalid role');
      }
    }

    // Generate manifest number
    const manifestNumber = await this.generateManifestNumber();

    // Create manifest
    const manifest = new Manifest();
    manifest.manifestNumber = manifestNumber;
    manifest.originHub = originHub;
    manifest.destinationHub = destinationHub;
    if (riderId) {
      manifest.riderId = riderId;
    }
    manifest.status = ManifestStatus.CREATED;
    manifest.totalShipments = shipments.length;
    manifest.createdById = user.id;
    if (notes) {
      manifest.notes = notes;
    }

    await this.manifestRepository.save(manifest);

    // Link shipments to manifest and update status
    for (const shipment of shipments) {
      shipment.manifestId = manifest.id;
      shipment.status = ShipmentStatus.IN_TRANSIT;
      shipment.nextHub = destinationHub;
      await this.shipmentRepository.save(shipment);
    }

    // Update manifest to IN_TRANSIT
    manifest.status = ManifestStatus.IN_TRANSIT;
    manifest.dispatchDate = new Date();
    await this.manifestRepository.save(manifest);

    return {
      success: true,
      manifest: {
        id: manifest.id,
        manifestNumber: manifest.manifestNumber,
        originHub: manifest.originHub,
        destinationHub: manifest.destinationHub,
        totalShipments: manifest.totalShipments,
        status: manifest.status,
        dispatchDate: manifest.dispatchDate,
      },
      message: `Manifest ${manifestNumber} created with ${shipments.length} shipments`,
    };
  }

  /**
   * Receive Manifest at destination hub
   */
  async receiveManifest(
    manifestId: string,
    receiveManifestDto: ReceiveManifestDto,
    user: User,
  ) {
    const { receivedAwbNumbers, hubLocation, notes } = receiveManifestDto;

    // Find manifest
    const manifest = await this.manifestRepository.findOne({
      where: { id: manifestId },
      relations: ['shipments'],
    });

    if (!manifest) {
      throw new NotFoundException('Manifest not found');
    }

    // Verify manifest is in transit
    if (manifest.status !== ManifestStatus.IN_TRANSIT) {
      throw new BadRequestException(
        'Manifest is not in transit, cannot receive',
      );
    }

    // Verify hub location matches destination
    if (manifest.destinationHub !== hubLocation) {
      throw new BadRequestException(
        `This manifest is for ${manifest.destinationHub}, not ${hubLocation}`,
      );
    }

    // Get manifest shipments
    const manifestShipmentAwbs = manifest.shipments.map((s) => s.awb);

    // Check for discrepancies
    const notInManifest = receivedAwbNumbers.filter(
      (awb) => !manifestShipmentAwbs.includes(awb),
    );
    const notReceived = manifestShipmentAwbs.filter(
      (awb) => !receivedAwbNumbers.includes(awb),
    );

    // Update received shipments
    const receivedShipments = await this.shipmentRepository.find({
      where: { awb: In(receivedAwbNumbers) },
    });

    for (const shipment of receivedShipments) {
      shipment.status = ShipmentStatus.IN_HUB;
      shipment.currentHub = hubLocation;
      await this.shipmentRepository.save(shipment);
    }

    // Update manifest
    manifest.status = ManifestStatus.RECEIVED;
    manifest.receivedDate = new Date();
    manifest.receivedById = user.id;
    
    if (notes || notInManifest.length > 0 || notReceived.length > 0) {
      const discrepancyNotes: string[] = [];
      if (notInManifest.length > 0) {
        discrepancyNotes.push(`Extra shipments: ${notInManifest.join(', ')}`);
      }
      if (notReceived.length > 0) {
        discrepancyNotes.push(`Missing shipments: ${notReceived.join(', ')}`);
      }
      if (notes) {
        discrepancyNotes.push(notes);
      }
      manifest.notes = discrepancyNotes.join(' | ');
    }

    await this.manifestRepository.save(manifest);

    return {
      success: true,
      manifestNumber: manifest.manifestNumber,
      receivedCount: receivedShipments.length,
      expectedCount: manifest.totalShipments,
      discrepancies: {
        notInManifest,
        notReceived,
      },
      message: `Manifest ${manifest.manifestNumber} received at ${hubLocation}`,
    };
  }

  /**
   * Close manifest (mark as completed)
   */
  async closeManifest(manifestId: string, user: User) {
    const manifest = await this.manifestRepository.findOne({
      where: { id: manifestId },
    });

    if (!manifest) {
      throw new NotFoundException('Manifest not found');
    }

    if (manifest.status !== ManifestStatus.RECEIVED) {
      throw new BadRequestException(
        'Can only close received manifests',
      );
    }

    manifest.status = ManifestStatus.CLOSED;
    await this.manifestRepository.save(manifest);

    return {
      success: true,
      manifestNumber: manifest.manifestNumber,
      message: 'Manifest closed successfully',
    };
  }

  /**
   * Sorting operation - Mark shipments for specific destination
   */
  async sortShipments(sortingDto: SortingDto, user: User) {
    const { awbNumbers, hubLocation, destinationHub } = sortingDto;

    // Validate all shipments exist
    const shipments = await this.shipmentRepository.find({
      where: { awb: In(awbNumbers) },
    });

    if (shipments.length !== awbNumbers.length) {
      const foundAwbs = shipments.map((s) => s.awb);
      const notFound = awbNumbers.filter((awb) => !foundAwbs.includes(awb));
      throw new BadRequestException(
        `Shipments not found: ${notFound.join(', ')}`,
      );
    }

    // Verify shipments are at hub
    const invalidShipments = shipments.filter(
      (s) => s.currentHub !== hubLocation || s.status !== ShipmentStatus.IN_HUB,
    );

    if (invalidShipments.length > 0) {
      throw new BadRequestException(
        `Some shipments are not at ${hubLocation}: ${invalidShipments.map((s) => s.awb).join(', ')}`,
      );
    }

    // Update next hub for routing
    for (const shipment of shipments) {
      shipment.nextHub = destinationHub;
      await this.shipmentRepository.save(shipment);
    }

    return {
      success: true,
      sortedCount: shipments.length,
      hubLocation,
      destinationHub,
      sortedShipments: shipments.map((s) => ({
        awb: s.awb,
        nextHub: s.nextHub,
      })),
      message: `Sorted ${shipments.length} shipments for ${destinationHub}`,
    };
  }

  /**
   * Get all manifests with pagination and filters
   */
  async findAll(
    filterDto: FilterManifestDto,
    user: User,
  ): Promise<PaginatedResponse<Manifest>> {
    const {
      page = 1,
      limit = 10,
      status,
      originHub,
      destinationHub,
      riderId,
      fromDate,
      toDate,
      search,
    } = filterDto;

    const queryBuilder = this.manifestRepository
      .createQueryBuilder('manifest')
      .leftJoinAndSelect('manifest.createdBy', 'createdBy')
      .leftJoinAndSelect('manifest.receivedBy', 'receivedBy')
      .leftJoinAndSelect('manifest.rider', 'rider')
      .leftJoinAndSelect('manifest.shipments', 'shipments');

    // Apply filters
    if (status) {
      queryBuilder.andWhere('manifest.status = :status', { status });
    }

    if (originHub) {
      queryBuilder.andWhere('manifest.originHub = :originHub', { originHub });
    }

    if (destinationHub) {
      queryBuilder.andWhere('manifest.destinationHub = :destinationHub', {
        destinationHub,
      });
    }

    if (riderId) {
      queryBuilder.andWhere('manifest.riderId = :riderId', { riderId });
    }

    if (fromDate && toDate) {
      queryBuilder.andWhere('manifest.dispatchDate BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
      });
    }

    if (search) {
      queryBuilder.andWhere('manifest.manifestNumber ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('manifest.createdAt', 'DESC');

    const [data, totalItems] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get manifest by ID
   */
  async findOne(manifestId: string) {
    const manifest = await this.manifestRepository.findOne({
      where: { id: manifestId },
      relations: ['createdBy', 'receivedBy', 'rider', 'shipments', 'shipments.merchant'],
    });

    if (!manifest) {
      throw new NotFoundException('Manifest not found');
    }

    return manifest;
  }

  /**
   * Get hub inventory (shipments currently at hub)
   */
  async getHubInventory(hubLocation: string) {
    const shipments = await this.shipmentRepository.find({
      where: {
        currentHub: hubLocation,
        status: ShipmentStatus.IN_HUB,
      },
      relations: ['merchant'],
      order: { createdAt: 'DESC' },
    });

    const statistics = {
      totalShipments: shipments.length,
      byDestination: {} as Record<string, number>,
      byType: {
        express: 0,
        normal: 0,
      },
      codShipments: 0,
      totalCodAmount: 0,
    };

    shipments.forEach((shipment) => {
      // Count by next hub/destination
      const destination = shipment.nextHub || shipment.deliveryArea || 'Unknown';
      statistics.byDestination[destination] =
        (statistics.byDestination[destination] || 0) + 1;

      // Count by type
      if (shipment.deliveryType === 'express') {
        statistics.byType.express++;
      } else {
        statistics.byType.normal++;
      }

      // COD statistics
      if (shipment.codAmount > 0) {
        statistics.codShipments++;
        statistics.totalCodAmount += parseFloat(shipment.codAmount.toString());
      }
    });

    return {
      hubLocation,
      statistics,
      shipments: shipments.map((s) => ({
        awb: s.awb,
        merchantName: s.merchant?.name,
        deliveryArea: s.deliveryArea,
        nextHub: s.nextHub,
        weight: s.weight,
        codAmount: s.codAmount,
        deliveryType: s.deliveryType,
        createdAt: s.createdAt,
      })),
    };
  }

  /**
   * Get statistics for manifests
   */
  async getStatistics(hubLocation?: string) {
    const queryBuilder = this.manifestRepository.createQueryBuilder('manifest');

    if (hubLocation) {
      queryBuilder.where(
        'manifest.originHub = :hubLocation OR manifest.destinationHub = :hubLocation',
        { hubLocation },
      );
    }

    const [total, created, inTransit, received, closed] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('manifest.status = :status', { status: ManifestStatus.CREATED }).getCount(),
      queryBuilder.clone().andWhere('manifest.status = :status', { status: ManifestStatus.IN_TRANSIT }).getCount(),
      queryBuilder.clone().andWhere('manifest.status = :status', { status: ManifestStatus.RECEIVED }).getCount(),
      queryBuilder.clone().andWhere('manifest.status = :status', { status: ManifestStatus.CLOSED }).getCount(),
    ]);

    return {
      total,
      created,
      inTransit,
      received,
      closed,
      hubLocation: hubLocation || 'All Hubs',
    };
  }
}
