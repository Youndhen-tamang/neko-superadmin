"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SuperShell } from "@/components/layout/super-shell";
import { Button } from "@/components/ui/button";
import { Agency, api, storefrontUrl } from "@/lib/api";

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);

  useEffect(() => {
    api<{ agencies: Agency[] }>("/api/super-admin/agencies").then((data) => setAgencies(data.agencies));
  }, []);

  return (
    <SuperShell>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-medium">Agencies</h1>
        <Button asChild>
          <Link href="/super-admin/agencies/new">New agency</Link>
        </Button>
      </div>
      <div className="mt-8 space-y-3">
        {agencies.map((agency) => (
          <div key={agency.id} className="flex items-center justify-between rounded-xl border bg-card p-5">
            <div>
              <p className="font-medium">{agency.name}</p>
              <p className="text-sm text-muted-foreground">
                {agency.brand_name} · {agency.slug} · {agency.adminEmail}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {agency.productCount} products · {agency.orderCount} orders · {agency.status}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href={storefrontUrl(agency.slug)} target="_blank" rel="noreferrer">
                  Open store
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/super-admin/products?agencyId=${agency.id}`}>Products</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/super-admin/agencies/${agency.id}`}>Manage</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </SuperShell>
  );
}
