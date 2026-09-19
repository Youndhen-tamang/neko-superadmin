export type TenantRequestStatus = "pending" | "approved" | "rejected";

export type TenantRequest = {
  id: string;
  name: string;
  slug: string;
  brandName: string;
  email: string;
  phone: string;
  address: string;
  tagline: string;
  adminName: string;
  adminEmail: string;
  message: string;
  status: TenantRequestStatus;
  createdAt: string;
};

export function hasAdminToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  return auth.startsWith("Bearer ") && auth.slice(7).trim().length > 0;
}
