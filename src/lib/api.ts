export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const TOKEN_KEY = "super_admin_token";

export function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function api<T>(path: string, options: RequestInit & { slug?: string } = {}): Promise<T> {
  const { slug, headers, ...rest } = options;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(rest.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(slug ? { "X-Agency-Slug": slug } : {}),
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...headers,
    },
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

export function storefrontUrl(slug: string) {
  const host = process.env.NEXT_PUBLIC_STORE_HOST || "localhost";
  const port = process.env.NEXT_PUBLIC_STORE_PORT || "3000";
  return `http://${slug}.${host}:${port}`;
}

export type Agency = {
  id: string;
  name: string;
  slug: string;
  brand_name: string;
  status: string;
  adminEmail?: string;
  productCount?: number;
  orderCount?: number;
  primary_color: string;
  email?: string | null;
  whatsapp?: {
    enabled: boolean;
    phoneNumberId: string | null;
    displayPhone: string | null;
    hasAccessToken: boolean;
  };
};

export type Product = {
  id: string;
  agency_id?: string;
  agency_name?: string;
  agency_slug?: string;
  name: string;
  description: string | null;
  category: string | null;
  tags: string[] | string;
  images: string[] | string;
  price_cents: number;
  stock: number;
  low_stock_threshold?: number;
  status: "draft" | "published";
};

export type Analytics = {
  range: { from: string; to: string };
  summary: {
    orderCount: number;
    paidOrderCount: number;
    revenueCents: number;
    unitsSold: number;
    avgOrderCents: number;
  };
  inventory: {
    total: number;
    published: number;
    draft: number;
    lowStock: number;
    categories: string[];
  };
  revenueByDay: { date: string; orderCount: number; revenueCents: number }[];
  ordersByStatus: { status: string; count: number; revenueCents: number }[];
  topProducts: { productId: string | null; name: string; quantity: number; revenueCents: number }[];
  byCategory: { category: string; quantity: number; revenueCents: number }[];
  byAgency: { agencyId: string; name: string; slug: string; orderCount: number; revenueCents: number }[];
};
