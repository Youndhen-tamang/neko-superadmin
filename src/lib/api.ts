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

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers,
    },
  });
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
};
