// ==================== Interfaces ====================

export interface SLAStatistics {
  pickupSLA: {
    violations: number;
    threshold: number;
  };
  deliverySLA: {
    violations: number;
    threshold: number;
  };
  totalViolations: number;
  lastChecked: string;
}

export interface ShipmentSLAStatus {
  isViolated: boolean;
  violations: string[];
  details: {
    awb: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    pickupSLA: number;
    deliverySLA: number;
    inTransitSLA: number;
  };
}

export interface SLAQueueStatus {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  total: number;
}
