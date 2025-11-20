export declare class GeoService {
    calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number;
    private toRadians;
    estimateDistanceByLocation(senderCity: string, senderArea: string, receiverCity: string, receiverArea: string): number;
}
