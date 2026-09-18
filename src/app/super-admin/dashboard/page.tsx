"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SuperShell } from "@/components/layout/super-shell";
import { Card } from "@/components/ui/card";
import { Agency, api } from "@/lib/api";
import { money } from "@/lib/utils";

type Stats = {
  agencyCount: number;
  orderCount: number;
  revenueCents: number;
  recentAgencies: Agency[];
};

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api<{ stats: Stats }>("/api/super-admin/dashboard")
      .then((data) => setStats(data.stats))
      .catch(() => undefined);
  }, []);

  return (
    <SuperShell>
      <h1 className="text-3xl font-medium">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Create agencies, then open each storefront as a branded shop.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["Agencies", stats?.agencyCount ?? 0],
          ["Orders", stats?.orderCount ?? 0],
          ["Platform revenue", money(stats?.revenueCents ?? 0)],
        ].map(([label, value]) => (
          <Card key={String(label)} className="p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl">{value}</p>
          </Card>
        ))}
      </div>
      <div className="mt-10">
        <div className="flex items-center justify-between">
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{agency.brand_name}</p>
                  <p className="text-sm text-muted-foreground">/{agency.slug}</p>
                </div>
                <span className="text-sm capitalize">{agency.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SuperShell>
  );
}
