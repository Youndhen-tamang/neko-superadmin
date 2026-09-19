import { NextResponse } from "next/server";
import { hasAdminToken, type TenantRequestStatus } from "@/lib/tenant-requests";
import { readRequests, writeRequests } from "@/lib/tenant-request-store";

const STATUSES: TenantRequestStatus[] = ["pending", "approved", "rejected"];

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const requests = await readRequests();
  const request = requests.find((item) => item.id === id);
  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  return NextResponse.json({ request });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { status?: string };
  if (!body.status || !STATUSES.includes(body.status as TenantRequestStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const requests = await readRequests();
  const index = requests.findIndex((item) => item.id === id);
  if (index === -1) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  requests[index] = { ...requests[index], status: body.status as TenantRequestStatus };
  await writeRequests(requests);
  return NextResponse.json({ request: requests[index] });
}
