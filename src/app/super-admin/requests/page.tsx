"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SuperShell } from "@/components/layout/super-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";
import { api, tenantRequestUrl } from "@/lib/api";
import type { TenantRequest, TenantRequestStatus } from "@/lib/tenant-requests";

export default function TenantRequestsPage() {
  const [requests, setRequests] = useState<TenantRequest[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api<{ requests: TenantRequest[] }>("/api/tenant-requests")
      .then((data) => setRequests(data.requests))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: TenantRequestStatus) {
    try {
      await api(`/api/tenant-requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(status === "rejected" ? "Request rejected" : "Request updated");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update request");
    }
  }

  return (
    <SuperShell>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-medium">Tenant requests</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Incoming registration requests. Create an agency from a request to prefill the form.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            await navigator.clipboard.writeText(tenantRequestUrl());
            toast.success("Public request form link copied");
          }}
        >
          Copy public form link
        </Button>
      </div>
      {loading ? (
        <PageLoader label="Loading requests" />
      ) : requests.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">No tenant requests yet.</p>
      ) : (
        <div className="mt-8 space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="rounded-xl border bg-card p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{request.brandName || request.name}</p>
                    <Badge className="capitalize">{request.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {request.name} · /{request.slug}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {request.adminName} · {request.adminEmail}
                    {request.phone ? ` · ${request.phone}` : ""}
                  </p>
                  {request.message ? <p className="mt-3 text-sm">{request.message}</p> : null}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {request.status === "pending" ? (
                    <>
                      <Button asChild>
                        <Link href={`/super-admin/agencies/new?requestId=${request.id}`}>Create agency</Link>
                      </Button>
                      <Button variant="outline" onClick={() => setStatus(request.id, "rejected")}>
                        Reject
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SuperShell>
  );
}
