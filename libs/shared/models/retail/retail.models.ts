export enum CashDrawerStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum CashMovementType {
  SALE_INCOME = 'SALE_INCOME',
  MANUAL_IN = 'MANUAL_IN',
  MANUAL_OUT = 'MANUAL_OUT',
}

export enum RetailStockMovementType {
  SALE = 'SALE',
  INVENTORY_IN = 'INVENTORY_IN',
  INVENTORY_OUT = 'INVENTORY_OUT',
  ADJUST = 'ADJUST',
  PURCHASE = 'PURCHASE',
}

export type RetailExpenseCategory = 'RENT' | 'UTILITIES' | 'TAXES' | 'CLEANING' | 'OTHER';

export interface RetailExpense {
  id: string;
  amount: number;
  category: RetailExpenseCategory;
  note: string;
  drawerId: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  active: boolean;
}

export interface Purchase {
  id: string;
  supplierId: string;
  supplier?: Supplier;
  totalAmount: number;
  operatorId?: string;
  createdAt: string;
  items?: PurchaseItem[];
}

export interface PurchaseItem {
  id: string;
  productId: string;
  product?: RetailProduct;
  quantity: number;
  costPrice: number;
}


export interface CashDrawer {
  id: string;
  status: CashDrawerStatus;
  openingBalance: number;
  currentBalance: number;
  closingBalance?: number;
  openedAt: string;
  closedAt?: string;
}

export interface CashMovement {
  id: string;
  drawerId: string;
  amount: number;
  type: CashMovementType;
  note?: string;
  createdAt: string;
}

export interface RetailProduct {
  id: string;
  name: string;
  barcode: string;
  sku: string;
  salePrice: number;
  costPrice: number;
  stock: number;
  active: boolean;
}

export interface Sale {
  id: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  items?: SaleItem[];
}

export interface SaleItem {
  productId: string;
  quantity: number;
  priceAtSale: number;
  totalAmount: number;
}
