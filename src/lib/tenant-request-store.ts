import { promises as fs } from "fs";
import path from "path";
import type { TenantRequest } from "@/lib/tenant-requests";

const filePath = path.join(process.cwd(), "data", "tenant-requests.json");

export async function readRequests(): Promise<TenantRequest[]> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeRequests(requests: TenantRequest[]) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(requests, null, 2));
}
