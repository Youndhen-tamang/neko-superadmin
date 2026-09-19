"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SuperShell } from "@/components/layout/super-shell";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";
import { Agency, api, storefrontUrl } from "@/lib/api";

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ agencies: Agency[] }>("/api/super-admin/agencies")
      .then((data) => setAgencies(data.agencies))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SuperShell>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-medium">Agencies</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/super-admin/agencies/new">New agency</Link>
        </Button>
      </div>
      {loading ? (
        <PageLoader label="Loading agencies" />
      ) : (
        <div className="mt-8 space-y-3">
          {agencies.map((agency) => (
            <div
              key={agency.id}
              className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium">{agency.name}</p>
                <p className="text-sm text-muted-foreground">
                  {agency.brand_name} · {agency.slug} · {agency.adminEmail}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {agency.productCount} products · {agency.orderCount} orders · {agency.status}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" asChild className="flex-1 sm:flex-none">
                  <a href={storefrontUrl(agency.slug)} target="_blank" rel="noreferrer">
                    Open store
                  </a>
                </Button>
                <Button variant="outline" asChild className="flex-1 sm:flex-none">
                  <Link href={`/super-admin/products?agencyId=${agency.id}`}>Products</Link>
                </Button>
                <Button variant="outline" asChild className="flex-1 sm:flex-none">
                  <Link href={`/super-admin/agencies/${agency.id}`}>Manage</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SuperShell>
  );
}
