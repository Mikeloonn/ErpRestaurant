export type Role = 'Mesero' | 'Cajero' | 'Administrador';

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  password?: string;
}

export type TableStatus = 'Libre' | 'Ocupada' | 'Precuenta';

export interface Table {
  id: string;
  number: number;
  status: TableStatus;
  currentOrderId?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface ProductBatch {
  id: string;
  quantity: number;
  expirationDate: string; // YYYY-MM-DD
  dateAdded: string; // ISO string
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  stock: number;
  minStock: number;
  modifiers: string[];
  batches?: ProductBatch[];
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  isTakeaway?: boolean;
}

export type OrderType = 'Salon' | 'Llevar' | 'Delivery';

export type PaymentMethod = 'Efectivo' | 'Yape/Plin' | 'Tarjeta';

export interface Order {
  id: string;
  type: OrderType;
  tableId?: string;
  customerName?: string;
  customerDocument?: string;
  customerAddress?: string;
  customerPhone?: string;
  items: OrderItem[];
  status: 'Abierta' | 'Precuenta' | 'Pagada' | 'Anulada';
  total: number;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt?: string;
}

export interface KardexMovement {
  id: string;
  productId: string;
  type: 'Entrada' | 'Salida' | 'Ajuste';
  quantity: number;
  reason: string;
  date: string;
  userId: string;
}

export interface CashTransaction {
  id: string;
  type: 'Ingreso' | 'Egreso';
  amount: number;
  reason: string;
  date: string;
  userId: string;
  orderId?: string;
  paymentMethod?: PaymentMethod;
}

export interface CashShift {
  id: string;
  openedAt: string;
  closedAt?: string;
  openedBy: string;
  closedBy?: string;
  initialAmount: number;
  finalAmount?: number;
  status: 'Abierta' | 'Cerrada';
}
