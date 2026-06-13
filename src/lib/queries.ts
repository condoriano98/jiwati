import { createClient } from "@/lib/supabase/server";
import type { Product, Category, BlogPost } from "@/lib/types";

const PRODUCT_SELECT =
  "*, brand:brands(*), product_categories(categories(*))";

type RawProduct = Omit<Product, "categories"> & {
  product_categories?: { categories: Category }[];
};

function shape(row: RawProduct): Product {
  const { product_categories, ...rest } = row;
  return {
    ...rest,
    categories: product_categories?.map((pc) => pc.categories) ?? [],
  };
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  return data ?? [];
}

export async function getProducts(opts: {
  category?: string;
  brand?: string;
  search?: string;
  sort?: string;
  bestseller?: boolean;
  limit?: number;
} = {}): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true);

  if (opts.bestseller) query = query.eq("is_bestseller", true);
  if (opts.brand) query = query.eq("brand_id", opts.brand);
  if (opts.search) query = query.ilike("name", `%${opts.search}%`);

  switch (opts.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("rating", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }
  if (opts.limit) query = query.limit(opts.limit);

  const { data } = await query;
  let products = (data as RawProduct[] | null)?.map(shape) ?? [];

  // Category filter is post-processed since it lives in a join table.
  if (opts.category) {
    products = products.filter((p) =>
      p.categories?.some((c) => c.slug === opts.category),
    );
  }
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  return data ? shape(data as RawProduct) : null;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data ?? null;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });
  return data ?? [];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data ?? null;
}
