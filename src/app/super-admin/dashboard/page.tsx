"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SuperShell } from "@/components/layout/super-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DashboardSkeleton } from "@/components/ui/page-loader";
import { Agency, api, appApi } from "@/lib/api";
import type { TenantRequest } from "@/lib/tenant-requests";
import { money } from "@/lib/utils";

type Stats = {
  agencyCount: number;
  orderCount: number;
  revenueCents: number;
  likeCount?: number;
  commentCount?: number;
  recentAgencies: Agency[];
};

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [requests, setRequests] = useState<TenantRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      api<{ stats: Stats }>("/api/super-admin/dashboard")
        .then((data) => {
          if (active) setStats(data.stats);
        })
        .catch(() => toast.error("Could not load dashboard")),
      appApi<{ requests: TenantRequest[] }>("/api/tenant-requests")
        .then((data) => {
          if (active) setRequests(data.requests.filter((item) => item.status === "pending"));
        })
        .catch(() => undefined),
    ]).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <SuperShell>
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-medium">Dashboard</h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Create agencies, then open each storefront as a branded shop.
              </p>
            </div>
            <Link href="/super-admin/comments" className="text-sm text-primary">
              Open comments
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[
              ["Agencies", stats?.agencyCount ?? 0],
              ["Orders", stats?.orderCount ?? 0],
              ["Platform revenue", money(stats?.revenueCents ?? 0)],
              ["Likes", stats?.likeCount ?? 0],
              ["Comments", stats?.commentCount ?? 0],
            ].map(([label, value]) => (
              <Card key={String(label)} className="p-4 sm:p-5">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 break-words text-2xl sm:text-3xl">{value}</p>
              </Card>
            ))}
          </div>
          <div className="mt-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl">Tenant requests</h2>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="text-sm text-primary"
                  onClick={async () => {
                    await navigator.clipboard.writeText(`${window.location.origin}/request`);
                    toast.success("Public request form link copied");
                  }}
                >
                  Copy request form
                </button>
                <Link href="/super-admin/requests" className="text-sm text-primary">
                  View all
                </Link>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {requests.length === 0 ? (
                <p className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
                  No pending tenant requests. Share the public form at{" "}
                  <Link href="/request" className="text-primary">
                    /request
                  </Link>
                  .
                </p>
              ) : (
                requests.map((request) => (
                  <div key={request.id} className="rounded-xl border bg-card p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium">{request.brandName || request.name}</p>
                        <p className="text-sm text-muted-foreground">
                          /{request.slug} · {request.adminName} · {request.adminEmail}
                        </p>
                      </div>
                      <Button asChild className="w-full sm:w-auto">
                        <Link href={`/super-admin/agencies/new?requestId=${request.id}`}>Create agency</Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="mt-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl">Recent agencies</h2>
              <Link href="/super-admin/agencies/new" className="text-sm text-primary">
                Create agency
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {(stats?.recentAgencies || []).map((agency) => (
                <Link
                  key={agency.id}
                  href={`/super-admin/agencies/${agency.id}`}
                  className="block rounded-xl border bg-card p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{agency.brand_name}</p>
                      <p className="text-sm text-muted-foreground">/{agency.slug}</p>
                    </div>
                    <span className="shrink-0 text-sm capitalize">{agency.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </SuperShell>
  );
}
