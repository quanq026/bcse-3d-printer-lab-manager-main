export enum Role {
  STUDENT = 'Student',
  MODERATOR = 'Moderator',
  ADMIN = 'Admin',
}

export enum JobStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  PENDING_REVIEW = 'Pending review',
  APPROVED = 'Approved',
  SCHEDULED = 'Scheduled',
  PRINTING = 'Printing',
  DONE = 'Done',
  REJECTED = 'Rejected',
  CANCELLED = 'Cancelled',
  NEEDS_REVISION = 'Needs Revision',
}

export enum MaterialType {
  PLA = 'PLA',
  PETG = 'PETG',
  TPU = 'TPU',
  ABS = 'ABS',
}

export enum MaterialSource {
  OWN = 'Personal',
  LAB = 'Lab',
}

export interface User {
  id: string;
  fullName: string;
  studentId?: string;
  email: string;
  role: Role;
  phone?: string;
  supervisor?: string;
}

export interface Printer {
  id: string;
  name: string;
  buildVolume: string;
  supportedMaterials: MaterialType[];
  status: 'Available' | 'Busy' | 'Maintenance';
  queueLength: number;
  nextAvailable?: string;
  location?: string;
  imageUrl?: string;
  hasAMS?: boolean;
}

export interface FilamentInventory {
  id: string;
  material: MaterialType;
  color: string;
  remainingGrams: number;
  threshold: number;
  status: 'In Stock' | 'Low' | 'Out of Stock';
}

export interface PrintJob {
  id: string;
  userId: string;
  userName: string;
  jobName: string;
  description?: string;
  fileName: string;
  estimatedTime: string; // e.g., "3h 30m"
  estimatedGrams: number;
  actualGrams?: number;
  materialType: MaterialType;
  color: string;
  materialSource: MaterialSource;
  printerId?: string;
  printerName?: string;
  slotTime?: string;
  status: JobStatus;
  cost: number;
  createdAt: string;
  rejectionReason?: string;
  revisionNote?: string;
  notes?: string;
  moderatorName?: string;
}

export interface PricingRule {
  material: MaterialType;
  pricePerGram: number;
}
