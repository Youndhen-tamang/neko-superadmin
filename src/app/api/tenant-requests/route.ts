import { NextResponse } from "next/server";
import { slugify } from "@/lib/utils";
import { hasAdminToken, type TenantRequest } from "@/lib/tenant-requests";
import { readRequests, writeRequests } from "@/lib/tenant-request-store";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(req: Request) {
  if (!hasAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const requests = await readRequests();
  return NextResponse.json({
    requests: requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = asString(body.name);
  const brandName = asString(body.brandName) || name;
  const slug = slugify(asString(body.slug) || name);
  const adminName = asString(body.adminName);
  const adminEmail = asString(body.adminEmail);
  const email = asString(body.email) || adminEmail;

  if (!name || !slug || !brandName || !adminName || !adminEmail) {
    return NextResponse.json({ error: "Name, slug, brand, admin name, and admin email are required" }, { status: 400 });
  }
  if (!SLUG_PATTERN.test(slug)) {
    return NextResponse.json({ error: "Slug can only include lowercase letters, numbers, and hyphens" }, { status: 400 });
  }

  const requests = await readRequests();
  const request: TenantRequest = {
    id: crypto.randomUUID(),
    name,
    slug,
    brandName,
    email,
    phone: asString(body.phone),
    address: asString(body.address),
    tagline: asString(body.tagline),
    adminName,
    adminEmail,
    message: asString(body.message),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  requests.push(request);
  await writeRequests(requests);
  return NextResponse.json({ request }, { status: 201 });
}
