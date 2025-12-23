
export type Role = 'USER' | 'DRIVER' | 'ADMIN' | 'OWNER';

export type AccountStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED';

export enum RideStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export type ServiceType = 'CAR' | 'HABAL' | 'PABILI' | 'RENTAL' | 'STAY' | 'E_SERBISYO';
export type PaymentMethodType = 'CASH' | 'GCASH';
export type RateType = 'HOURLY' | 'DAILY' | 'WEEKLY' | 'SEMI_MONTHLY' | 'MONTHLY' | 'PAKYAW';

// Define the VehicleCategory type for rental service classification
export type VehicleCategory = 'SEDAN' | 'SUV' | 'VAN_PICKUP';

export interface DriverDocuments {
  license: string;
  registration: string;
  vehicleFront: string;
  vehicleBack: string;
  vehicleLeft: string;
  vehicleRight: string;
  selfie: string;
}

export interface Ride {
  id: string;
  userId: string;
  userName: string;
  driverId?: string;
  driverName?: string;
  origin: string;
  destination: string;
  originCoords?: [number, number];
  destinationCoords?: [number, number];
  fare: number;
  tip?: number;
  status: RideStatus;
  timestamp: number;
  serviceType: ServiceType;
  pabiliItems?: string;
  serviceDescription?: string; // For E-Serbisyo
  eSerbisyoSubCategory?: string; // Specific niche for E-Serbisyo
  rateType?: RateType; // Hourly, Daily, etc.
  duration?: number; // Number of hours, days, etc.
  paymentMethod: PaymentMethodType;
  // Priority Booking
  isPriority?: boolean;
  // Car Rental specific
  rentalVehicle?: string;
  rentalDays?: number;
  isOutsideCity?: boolean;
  hasDriver?: boolean;
  includeCarWash?: boolean;
  carWashFee?: number;
  // Stay specific
  stayTitle?: string;
  checkInDate?: string;
  checkOutDate?: string;
  stayDays?: number;
  // Advance Booking
  isAdvanceBooking?: boolean;
  scheduledDate?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  rating: number;
  balance: number;
  status: AccountStatus;
  joinDate: number;
}

export interface DriverProfile extends UserProfile {
  vehicleModel: string;
  plateNumber: string;
  isOnline: boolean;
  totalEarnings: number;
  vehicleType: ServiceType;
  documents?: DriverDocuments;
  // E-Serbisyo specific
  serviceRate?: number; 
  eSerbisyoCategory?: string;
  // Rental Owner Details
  rentalPrice?: number;
  rentalImages?: string[];
  carWashFee?: number;
  // House Owner Details
  stayPrice?: number;
  stayImages?: string[];
  ownerType?: 'CAR' | 'HOUSE' | 'BOTH';
}
