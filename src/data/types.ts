// Fields marked "API" mirror the fixsys GraphQL schema and were added to close
// design↔API gaps. Fields marked "design-only (coming feature)" have no API
// counterpart yet and should be tagged with <ComingSoon /> in the UI.

export interface Customer extends ApiEntity {
  id: string;
  name: string;
  phone: string;
  cars: number;
  totalSpent: number;
  debt: number; // API: outstandingBalance
  lastVisit: string;
  status: string;
  // API additions
  email?: string;
  address?: string;
  type?: string; // API: CustomerType (فرد / شركة)
  createdAt?: string; // API: createdAt
}

export interface Vehicle extends ApiEntity {
  plate: string;
  make: string;
  model: string;
  year: string;
  color: string;
  owner: string;
  mileage: number;
  lastService: string;
  vin: string;
  // API additions
  trim?: string; // API: catalog.trim
  ownershipHistory?: string[]; // API: ownershipHistories
  registeredAt?: string; // API: createdAt
}

export interface Part extends ApiEntity {
  sku: string;
  name: string;
  category: string;
  brand: string;
  stock: number;
  minStock: number;
  price: number;
  compatible: string[];
  // API additions
  barcode?: string; // API: barcode
  oem?: string; // API: oem
  salesUoM?: string; // API: salesUoM
  alternatives?: string[]; // API: alternatives
  averageCost?: number; // API: InventoryItem.averageCost
  available?: number; // API: InventoryItem.availableQuantity
  allocated?: number; // API: InventoryItem.allocatedQuantity
}

export interface ServiceCategory extends ApiEntity {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string; // API: description
}

export interface Service extends ApiEntity {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  extraPrice: number | null;
  duration: string;
  status: string;
  // API additions
  description?: string; // API: description
  pricingModel?: string; // API: PricingModel
  requiredBay?: string; // API: requiredBayType
  requiredSpecialty?: string; // API: requiredTechnicianSpecialtyId
}

export interface TechnicianTask {
  id: string;
  car: string;
  service: string;
  progress: number;
}

export interface TechnicianTimeLog {
  task: string;
  clockIn: string;
  clockOut: string | null;
  status: string; // API: TaskClockStatus
}

export interface Technician extends ApiEntity {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  status: string;
  tasks: number;
  maxTasks: number;
  rating: number;
  completedJobs: number;
  joinDate: string;
  currentTasks: TechnicianTask[];
  // API additions
  employeeId?: string; // API: employeeId
  efficiency?: number; // API: technicianEfficiency (%)
  timeLogs?: TechnicianTimeLog[]; // API: timeLogs (clock in/out)
}

export interface WorkOrderSupplement {
  reason: string;
  amount: number;
  status: string; // API: SupplementStatus
  requestedAt: string;
}

export interface WorkOrder extends ApiEntity {
  id: string;
  customer: string;
  car: string;
  services: string[];
  parts: string[];
  tech: string;
  status: string;
  priority: string;
  total: number;
  date: string;
  progress: number;
  // API additions
  estimateId?: string; // API: estimateId
  startedAt?: string; // API: startedAt
  completedAt?: string; // API: completedAt
  supplements?: WorkOrderSupplement[]; // API: supplements
  notes?: string; // API: notes
}

export interface Appointment extends ApiEntity {
  scheduledAt?: string;
  id: string;
  day: number;
  hour: number;
  customer: string;
  service: string;
  car: string;
  tech: string;
  color: string;
  displayTime?: string;
  displayStatus?: string;
  // API additions
  complaintNotes?: string; // API: complaintNotes
  estimatedDuration?: string; // API: totalEstimatedDurationHours
}

export interface InvoicePayment {
  amount: number;
  method: string; // API: PaymentMethod
  date: string;
  reference?: string;
}

export interface Invoice extends ApiEntity {
  id: string;
  customer: string;
  workOrder: string;
  date: string;
  subtotal: number;
  vat: number;
  total: number;
  paid: number;
  balance: number;
  status: string;
  // API additions
  discount?: number; // API: overallDiscount
  car?: string; // API: vehicleId
  paidAt?: string; // API: paidAt
  payments?: InvoicePayment[]; // API: payments
}

export interface QuotationItem {
  name: string;
  price: number;
  qty: number;
  decision?: string; // API: EstimateLineItem.decisionStatus (accepted/rejected)
  rejectionReason?: string; // API: rejectionReason
}

export interface Quotation extends ApiEntity {
  id: string;
  customer: string;
  car: string;
  date: string;
  validUntil: string;
  services: QuotationItem[];
  parts: QuotationItem[];
  discount: number;
  subtotal: number;
  vat: number;
  total: number;
  status: string;
  approvedAt: string;
  // API additions
  linkedInspection?: string; // API: inspectionSessionId
  presentedAt?: string; // API: presentedAt
}

export interface PurchaseOrderItem {
  name: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder extends ApiEntity {
  id: string;
  supplier: string;
  supplierCode: string;
  date: string;
  expectedDate: string;
  items: PurchaseOrderItem[];
  total: number;
  status: string;
  notes: string;
}

export interface Department extends ApiEntity {
  name: string;
  head: string;
  count: number;
  color: string;
  description?: string; // API: description
}

export interface Employee extends ApiEntity {
  id: string;
  name: string;
  role: string;
  dept: string;
  phone: string;
  status: string;
  since: string;
  tasks: number;
  // API additions
  email?: string;
  address?: string;
  basicSalary?: number; // API: basicSalary
  statusReason?: string; // API: statusReason
}

// Whole Supplier concept is design-only (coming feature) — no Supplier type in API.
export interface Supplier extends ApiEntity {
  name: string;
  code: string;
  category: string;
  contact: string;
  phone: string;
  orders: number;
  lastOrder: string;
  status: string;
}

export interface WarehouseTransaction extends ApiEntity {
  id: string;
  type: string;
  part: string;
  qty: number;
  unit: string;
  ref: string;
  date: string;
  cost: number;
  // API additions
  createdBy?: string; // API: createdBy
  refType?: string; // API: referenceType
}

// Whole Role/Permission management is design-only (coming feature) —
// API only exposes a `roles: [String!]` string list, no Role/Permission types.
export interface Role extends ApiEntity {
  key?: string;
  id: string;
  name: string;
  users: number;
  color: string;
  permissions: string[];
}

export interface SystemUser extends ApiEntity {
  password?: string;
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  avatar: string;
}

export interface InspectionSection {
  name: string;
  items: string[];
}

export interface InspectionTemplate extends ApiEntity {
  id: string;
  name: string;
  type: string;
  points: number;
  usedCount: number;
  sections: InspectionSection[];
}

export interface InspectionDamage {
  location: string;
  note: string;
  hasPhoto: boolean; // API: PreExistingDamage + damage photo
}

export interface CustomInspection extends ApiEntity {
  templateId?: string;
  id: string;
  name: string;
  car: string;
  date: string;
  tech: string;
  points: number;
  result: string;
  status: string;
  // API additions
  customerSignature?: boolean; // API: customerSignatureUrl
  damages?: InspectionDamage[]; // API: damages / PreExistingDamage
}

// ── API-only entities not yet surfaced in the design ────────────────────────

// API: Branch — system is multi-branch (every entity carries branchId).
export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  contactNumber: string;
  isActive: boolean;
}

// API: CustomerLedgerEntry — per-customer accounting ledger.
export interface LedgerEntry {
  id: string;
  customer: string;
  type: string; // API: LedgerTransactionType
  amount: number;
  description: string;
  date: string;
}
export interface ApiEntity { apiId?: string; }
