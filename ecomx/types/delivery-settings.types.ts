export interface DeliveryDistanceBand {
  fromKm: number;
  toKm: number;
  charge: number;
}

export interface PublicDeliverySettings {
  originLabel: string;
  originLat: number;
  originLng: number;
  maxRadiusKm: number;
  /** Cart subtotal (QAR) at or above → free delivery; 0 = disabled */
  freeDeliveryMinOrderAmount: number;
  /** Free delivery for every order inside the radius */
  fullFreeDelivery: boolean;
  /** Free delivery within this many km of the store; 0 = disabled */
  freeDeliveryWithinKm: number;
  enabled: boolean;
}

export interface AdminDeliverySettings extends PublicDeliverySettings {
  _id?: string;
  distanceBands: DeliveryDistanceBand[];
  updatedAt?: string;
}

export interface DeliveryQuote {
  deliverable: boolean;
  message: string;
  distanceKm?: number | null;
  deliveryCharge?: number | null;
  distanceDeliveryCharge?: number | null;
  bandFromKm?: number;
  bandToKm?: number;
}

export type UpdateDeliverySettingsPayload = Partial<
  Pick<
    AdminDeliverySettings,
    | "originLabel"
    | "originLat"
    | "originLng"
    | "maxRadiusKm"
    | "fullFreeDelivery"
    | "freeDeliveryWithinKm"
    | "freeDeliveryMinOrderAmount"
    | "distanceBands"
    | "enabled"
  >
>;
