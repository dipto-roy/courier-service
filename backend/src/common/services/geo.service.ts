import { Injectable } from '@nestjs/common';

@Injectable()
export class GeoService {
  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Estimate distance based on city and area (when GPS not available)
   * This is a simplified version - in production, use actual city/area database
   */
  estimateDistanceByLocation(
    senderCity: string,
    senderArea: string,
    receiverCity: string,
    receiverArea: string,
  ): number {
    // Same city, same area
    if (senderCity === receiverCity && senderArea === receiverArea) {
      return 5; // 5 km
    }

    // Same city, different area
    if (senderCity === receiverCity) {
      return 15; // 15 km
    }

    // Different cities - base distance
    // In production, use actual city-to-city distance matrix
    return 50; // 50 km default for different cities
  }
}
