// Domain types mirroring the Supabase schema (see supabase/migrations).

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parent_id: string | null;
  sort_order: number;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  sku: string | null;
  brand_id: string | null;
  images: string[];
  rating: number;
  is_bestseller: boolean;
  is_active: boolean;
  created_at: string;
  // optional joined fields
  brand?: Brand | null;
  categories?: Category[];
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
};

export type Address = {
  id: string;
  user_id: string;
  label: string | null;
  recipient: string;
  phone: string;
  line1: string;
  village?: string;
  district?: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  payment_status: "unpaid" | "paid" | "failed";
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: Address | null;
  midtrans_order_id: string | null;
  created_at: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover: string | null;
  body: string;
  published_at: string | null;
};

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  stock: number;
  quantity: number;
};
