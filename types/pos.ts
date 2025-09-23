export interface Product {
  item_code: string;
  describtion: string;
  base_price: number;
  categorie: string;
  unit_sales?: string;
  stock: number;
  barcode?: string;
  image?: string;
}

export interface Customer {
  id: string;
  customerCode: string; // Code client Sage X3
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  creditLimit: number;
  paymentTerms: string;
  isActive: boolean;
  totalPurchases: number;
  defaultDeliveryLocationId?: string;
}

export interface TransactionItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Transaction {
  id: string;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: "cash" | "card" | "digital";
  customerId?: string;
  customer?: Customer;
  timestamp: Date;
  status: "pending" | "completed" | "refunded";
}

export interface Receipt {
  transactionId: string;
  businessName: string;
  businessAddress: string;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  timestamp: Date;
}

export interface DeliveryLocation {
  id: string;
  code: string; // Code site Sage X3
  name: string;
  address: string;
  contactPerson?: string;
  contactPhone?: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface CashSession {
  id: string;
  openingAmount: number;
  closingAmount?: number;
  openedAt: Date;
  closedAt?: Date;
  isActive: boolean;
  transactions: Transaction[];
}

export interface SalesOrder {
  id: string;
  orderNumber: string; // Format: SOH-YYYYMMDD-XXXX
  customerId: string;
  customer: Customer;
  deliveryLocationId: string;
  deliveryLocation: DeliveryLocation;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status:
    | "draft"
    | "pending_approval"
    | "approved"
    | "confirmed"
    | "shipped"
    | "invoiced"
    | "cancelled";
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  priority: "low" | "normal" | "high" | "urgent";
  expectedDeliveryDate?: Date;
  modifications: OrderModification[];
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  reservedStock: number;
  deliveryDate?: Date;
}

export interface OrderModification {
  id: string;
  timestamp: Date;
  userId: string;
  action: "created" | "modified" | "approved" | "rejected" | "cancelled";
  field?: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
}

export interface ApprovalWorkflow {
  id: string;
  orderId: string;
  requiredApprovers: string[];
  currentApprover?: string;
  approvals: Approval[];
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

export interface Approval {
  approverId: string;
  approverName: string;
  action: "approved" | "rejected";
  timestamp: Date;
  comments?: string;
}
