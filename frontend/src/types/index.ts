export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  image_url?: string;
  image?: string;
  rating: number;
  reviews?: number;
  description: string;
  specs: Record<string, string>;
  installment_eligible: boolean;
  vendor_id?: string;
  installmentEligible?: boolean;
  monthly_installment?: number;
  monthlyInstallment?: number;
  images?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'vendor' | 'super_admin' | 'customer_care';
  tier?: string;
  risk_score?: number;
  credit_limit?: number;
  interest_discount?: number;
  card_design?: string;
  is_card_active?: boolean;
  nin?: string;
  bvn?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
