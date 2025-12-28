
export enum Category {
  Grocery = 'Grocery',
  Dairy = 'Dairy',
  Beverages = 'Beverages',
  Snacks = 'Snacks',
  PersonalCare = 'Personal Care',
}

export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  OutForDelivery = 'Out for Delivery',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  mrp: number;
  price: number;
  image: string;
  stock: number;
  weight: string;
  brand: string;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  mobile: string;
  address: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: 'COD' | 'UPI';
  createdAt: number;
  timeSlot: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  isAdmin: boolean;
}
