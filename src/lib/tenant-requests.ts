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
