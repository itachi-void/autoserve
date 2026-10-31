export type UserRole = 'OrganizationAdmin' | 'BranchManager' | 'Cashier' | 'InventoryOfficer' | 'Accountant';

export type PaymentMethod = 'Cash' | 'Card' | 'Split' | 'MadaTap' | 'ApplePay';

export type SaleStatus = 'Completed' | 'Suspended' | 'Refunded' | 'Cancelled';

export type ShiftStatus = 'Open' | 'Closed' | 'Reconciled' | 'Discrepancy';

export interface User {
  id: string;
  orgId: string;
  branchId: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  language: 'ar' | 'en';
}

export interface Branch {
  id: string;
  orgId: string;
  nameEn: string;
  nameAr: string;
  code: string;
  city: string;
  address: string;
  taxNumber: string;
  receiptHeader: string;
  receiptFooter: string;
}

export interface Product {
  id: string;
  orgId: string;
  sku: string;
  barcode: string;
  nameEn: string;
  nameAr: string;
  categoryEn: string;
  categoryAr: string;
  unit: string;
  costPrice: number;
  sellPrice: number;
  taxRate: number; // e.g. 0.15 for 15% VAT
  imageUrl?: string;
  stockByBranch: Record<string, number>; // branchId -> quantity
}

export interface CartItem {
  productId: string;
  sku: string;
  nameEn: string;
  nameAr: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  taxRate: number;
  total: number;
}

export interface Sale {
  id: string;
  orgId: string;
  branchId: string;
  invoiceNumber: string; // e.g. "INV-2026-00492"
  cashierId: string;
  cashierName: string;
  customerName?: string;
  customerPhone?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeGiven: number;
  status: SaleStatus;
  items: CartItem[];
  zatcaQrCode: string; // ZATCA / E-Invoicing compliant base64 TLV
  createdAt: string;
}

export interface CashierShift {
  id: string;
  orgId: string;
  branchId: string;
  cashierId: string;
  cashierName: string;
  openingBalance: number;
  cashSales: number;
  cardSales: number;
  expectedCash: number;
  actualCash: number;
  difference: number;
  status: ShiftStatus;
  openedAt: string;
  closedAt?: string;
  notes?: string;
}
