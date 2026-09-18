"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SuperShell } from "@/components/layout/super-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Agency, api, storefrontUrl } from "@/lib/api";

export default function AgencyDetailPage() {
  const params = useParams<{ id: string }>();
  const [agency, setAgency] = useState<Agency | null>(null);

  useEffect(() => {
    api<{ agency: Agency }>(`/api/super-admin/agencies/${params.id}`).then((data) => setAgency(data.agency));
  }, [params.id]);

  if (!agency) {
    return (
      <SuperShell>
        <p>Loading agency...</p>
      </SuperShell>
    );
  }

  return (
    <SuperShell>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-medium">{agency.name}</h1>
          <p className="mt-1 text-muted-foreground">/{agency.slug}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/super-admin/products?agencyId=${agency.id}`}>Products</Link>
          </Button>
          <Button asChild variant="outline">
            <a href={storefrontUrl(agency.slug)} target="_blank" rel="noreferrer">
              Open storefront
            </a>
          </Button>
        </div>
      </div>
      <form
        className="mt-8 max-w-xl space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await api(`/api/super-admin/agencies/${agency.id}`, {
            method: "PATCH",
            body: JSON.stringify({
              name: agency.name,
              brandName: agency.brand_name,
              status: agency.status,
              email: agency.email,
            }),
          });
          toast.success("Agency updated");
        }}
      >
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={agency.name} onChange={(e) => setAgency({ ...agency, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Brand name</Label>
          <Input
            value={agency.brand_name}
            onChange={(e) => setAgency({ ...agency, brand_name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <select
            className="h-10 w-full rounded-md border bg-background px-3"
            value={agency.status}
            onChange={(e) => setAgency({ ...agency, status: e.target.value })}
          >
            <option value="active">active</option>
            <option value="suspended">suspended</option>
          </select>
        </div>
        <Button type="submit">Save</Button>
      </form>
    </SuperShell>
  );
}
