import { Product } from '@/services';

export const mockProducts: Product[] = [
  {
    id: '1', name: 'MacBook Pro 16"', brand: 'Apple', category: 'Laptops',
    price: 3250000, image: '', rating: 4.8, reviews: 342,
    description: 'The most powerful MacBook Pro ever with M3 Pro chip, 18GB RAM, and 512GB SSD. Perfect for professionals.',
    specs: { Processor: 'Apple M3 Pro', RAM: '18GB', Storage: '512GB SSD', Display: '16.2" Liquid Retina XDR', Battery: 'Up to 22 hours' },
    installmentEligible: true, monthlyInstallment: 275000, images: [],
  },
  {
    id: '2', name: 'iPhone 15 Pro Max', brand: 'Apple', category: 'Phones',
    price: 1850000, image: '', rating: 4.9, reviews: 1205,
    description: 'Titanium design, A17 Pro chip, 48MP camera system. The ultimate iPhone.',
    specs: { Processor: 'A17 Pro', RAM: '8GB', Storage: '256GB', Display: '6.7" Super Retina XDR', Camera: '48MP Triple' },
    installmentEligible: true, monthlyInstallment: 155000, images: [],
  },
  {
    id: '3', name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category: 'Phones',
    price: 1650000, image: '', rating: 4.7, reviews: 890,
    description: 'Galaxy AI, 200MP camera, S Pen included. The complete smartphone experience.',
    specs: { Processor: 'Snapdragon 8 Gen 3', RAM: '12GB', Storage: '256GB', Display: '6.8" Dynamic AMOLED', Camera: '200MP Quad' },
    installmentEligible: true, monthlyInstallment: 138000, images: [],
  },
  {
    id: '4', name: 'iPad Pro 12.9"', brand: 'Apple', category: 'Tablets',
    price: 1450000, image: '', rating: 4.8, reviews: 567,
    description: 'M2 chip, Liquid Retina XDR display. The ultimate iPad for creative professionals.',
    specs: { Processor: 'Apple M2', RAM: '8GB', Storage: '128GB', Display: '12.9" Liquid Retina XDR', Camera: '12MP Wide' },
    installmentEligible: true, monthlyInstallment: 121000, images: [],
  },
  {
    id: '5', name: 'Dell XPS 15', brand: 'Dell', category: 'Laptops',
    price: 2450000, image: '', rating: 4.6, reviews: 234,
    description: 'InfinityEdge display, 13th Gen Intel Core i7. Premium performance laptop.',
    specs: { Processor: 'Intel Core i7-13700H', RAM: '16GB', Storage: '512GB SSD', Display: '15.6" OLED 3.5K', Battery: 'Up to 13 hours' },
    installmentEligible: true, monthlyInstallment: 205000, images: [],
  },
  {
    id: '6', name: 'Sony WH-1000XM5', brand: 'Sony', category: 'Accessories',
    price: 450000, image: '', rating: 4.7, reviews: 2100,
    description: 'Industry-leading noise cancellation, 30-hour battery, premium comfort.',
    specs: { Type: 'Over-ear', 'Noise Cancellation': 'Yes', Battery: '30 hours', Connectivity: 'Bluetooth 5.2', Weight: '250g' },
    installmentEligible: true, monthlyInstallment: 38000, images: [],
  },
  {
    id: '7', name: 'Samsung Galaxy Tab S9', brand: 'Samsung', category: 'Tablets',
    price: 950000, image: '', rating: 4.5, reviews: 321,
    description: 'Snapdragon 8 Gen 2, Dynamic AMOLED display, S Pen included.',
    specs: { Processor: 'Snapdragon 8 Gen 2', RAM: '8GB', Storage: '128GB', Display: '11" Dynamic AMOLED', Battery: '8400mAh' },
    installmentEligible: true, monthlyInstallment: 79000, images: [],
  },
  {
    id: '8', name: 'AirPods Pro 2nd Gen', brand: 'Apple', category: 'Accessories',
    price: 350000, image: '', rating: 4.8, reviews: 3400,
    description: 'Active Noise Cancellation, Adaptive Transparency, USB-C charging.',
    specs: { Type: 'In-ear', 'Noise Cancellation': 'Yes', Battery: '6 hours (30 with case)', Connectivity: 'Bluetooth 5.3', Chip: 'H2' },
    installmentEligible: true, monthlyInstallment: 29000, images: [],
  },
];

export const mockOrders = [
  { id: 'ORD-001', product: 'MacBook Pro 16"', date: '2024-01-15', plan: '12 months', status: 'Active' as const, amount: 3250000 },
  { id: 'ORD-002', product: 'iPhone 15 Pro Max', date: '2024-02-01', plan: '6 months', status: 'Completed' as const, amount: 1850000 },
  { id: 'ORD-003', product: 'AirPods Pro', date: '2024-03-10', plan: '3 months', status: 'Processing' as const, amount: 350000 },
  { id: 'ORD-004', product: 'iPad Pro 12.9"', date: '2024-03-20', plan: '12 months', status: 'Pending' as const, amount: 1450000 },
];

export const mockInstallments = [
  { id: 'INS-001', product: 'MacBook Pro 16"', totalPrice: 3250000, amountPaid: 2200000, remaining: 1050000, progress: 67, nextPayment: '2024-04-15', monthlyAmount: 275000 },
  { id: 'INS-002', product: 'iPad Pro 12.9"', totalPrice: 1450000, amountPaid: 362500, remaining: 1087500, progress: 25, nextPayment: '2024-04-20', monthlyAmount: 121000 },
];

export const mockPayments = [
  { id: 'TXN-001', amount: 275000, date: '2024-03-15', status: 'Success', product: 'MacBook Pro 16"' },
  { id: 'TXN-002', amount: 121000, date: '2024-03-20', status: 'Success', product: 'iPad Pro 12.9"' },
  { id: 'TXN-003', amount: 275000, date: '2024-02-15', status: 'Success', product: 'MacBook Pro 16"' },
  { id: 'TXN-004', amount: 155000, date: '2024-02-01', status: 'Failed', product: 'iPhone 15 Pro Max' },
  { id: 'TXN-005', amount: 155000, date: '2024-02-05', status: 'Success', product: 'iPhone 15 Pro Max' },
];

export const mockNotifications = [
  { id: '1', title: 'Payment Reminder', message: 'Your MacBook Pro installment of ₦275,000 is due on April 15.', date: '2024-04-10', read: false, type: 'reminder' as const },
  { id: '2', title: 'Payment Confirmed', message: 'Payment of ₦121,000 for iPad Pro has been processed successfully.', date: '2024-03-20', read: true, type: 'success' as const },
  { id: '3', title: 'Payment Failed', message: 'Your payment of ₦155,000 for iPhone 15 Pro Max failed. Please retry.', date: '2024-02-01', read: true, type: 'error' as const },
];

export const categoryIcons: Record<string, string> = {
  Laptops: '', Phones: '', Tablets: '', Accessories: '',
};
