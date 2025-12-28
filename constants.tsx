
import { Category, Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Ashirvaad Shudh Chakki Atta',
    brand: 'Ashirvaad',
    category: Category.Grocery,
    mrp: 450,
    price: 399,
    image: 'https://picsum.photos/seed/atta/400/400',
    stock: 50,
    weight: '10kg',
    description: 'High quality whole wheat flour for soft rotis.'
  },
  {
    id: '2',
    name: 'Amul Taaza Milk',
    brand: 'Amul',
    category: Category.Dairy,
    mrp: 30,
    price: 28,
    image: 'https://picsum.photos/seed/milk/400/400',
    stock: 100,
    weight: '500ml',
    description: 'Pasteurized toned milk, rich in nutrition.'
  },
  {
    id: '3',
    name: 'Basmati Rice Premium',
    brand: 'India Gate',
    category: Category.Grocery,
    mrp: 180,
    price: 145,
    image: 'https://picsum.photos/seed/rice/400/400',
    stock: 25,
    weight: '1kg',
    description: 'Long grain aromatic basmati rice.'
  },
  {
    id: '4',
    name: 'Coca Cola',
    brand: 'Coke',
    category: Category.Beverages,
    mrp: 95,
    price: 85,
    image: 'https://picsum.photos/seed/coke/400/400',
    stock: 40,
    weight: '1.25L',
    description: 'Refreshing carbonated soft drink.'
  },
  {
    id: '5',
    name: 'Lay\'s Classic Salted',
    brand: 'Lay\'s',
    category: Category.Snacks,
    mrp: 20,
    price: 18,
    image: 'https://picsum.photos/seed/lays/400/400',
    stock: 200,
    weight: '50g',
    description: 'Crispy potato chips.'
  },
  {
    id: '6',
    name: 'Dove Soap Bar',
    brand: 'Dove',
    category: Category.PersonalCare,
    mrp: 65,
    price: 58,
    image: 'https://picsum.photos/seed/dove/400/400',
    stock: 60,
    weight: '100g',
    description: 'Moisturizing cream bar for soft skin.'
  }
];

export const CATEGORIES = Object.values(Category);
export const DELIVERY_FEE = 20;
export const MIN_FREE_DELIVERY = 499;
export const STORE_PHONE = "8208448392";
export const WHATSAPP_NUMBER = "918208448392"; 
export const STORE_ADDRESS = "Rakesh kirana store, NH848, kediya Rd, Bhiwandi, Maharashtra 421308";
export const VALID_COUPONS: Record<string, number> = {
  'RAKESH15': 15,
  'WELCOME10': 10
};
