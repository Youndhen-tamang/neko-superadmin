"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SuperShell } from "@/components/layout/super-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Agency, Analytics, api } from "@/lib/api";
import { money } from "@/lib/utils";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function BarList({ items }: { items: { label: string; value: number; display: string }[] }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No data for this range.</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="truncate pr-3">{item.label}</span>
            <span className="shrink-0 text-muted-foreground">{item.display}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SuperAnalyticsPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [from, setFrom] = useState(isoDate(new Date(Date.now() - 29 * 86400000)));
  const [to, setTo] = useState(isoDate(new Date()));
  const [agencyId, setAgencyId] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  function load(next = { from, to, agencyId, status, category }) {
    const params = new URLSearchParams({ from: next.from, to: next.to });
    if (next.agencyId) params.set("agencyId", next.agencyId);
    if (next.status) params.set("status", next.status);
    if (next.category) params.set("category", next.category);
    setLoading(true);
    api<{ analytics: Analytics }>(`/api/super-admin/dashboard/analytics?${params}`)
      .then((data) => setAnalytics(data.analytics))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    api<{ agencies: Agency[] }>("/api/super-admin/agencies")
      .then((data) => setAgencies(data.agencies))
      .catch((error) => toast.error(error.message));
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function preset(days: number) {
    const nextTo = isoDate(new Date());
    const nextFrom = isoDate(new Date(Date.now() - (days - 1) * 86400000));
    setFrom(nextFrom);
    setTo(nextTo);
    load({ from: nextFrom, to: nextTo, agencyId, status, category });
  }

  return (
    <SuperShell>
      <h1 className="text-3xl font-medium">Analytics</h1>
      <p className="mt-2 text-muted-foreground">Platform-wide sales, inventory, and agency comparison.</p>
      <form
        className="mt-6 grid gap-3 rounded-xl border bg-card p-4 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={agencyId}
          onChange={(e) => setAgencyId(e.target.value)}
        >
          <option value="">All agencies</option>
          {agencies.map((agency) => (
            <option key={agency.id} value={agency.id}>
              {agency.brand_name}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="lead">Lead</option>
          <option value="ordered">Ordered</option>
          <option value="dispatched">Dispatched</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {(analytics?.inventory.categories || []).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button className="h-10 rounded-md bg-primary px-4 text-sm text-primary-foreground" type="submit">
          Apply
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {[7, 30, 90].map((days) => (
          <button
            key={days}
            className="rounded-full border px-3 py-1 text-xs hover:bg-muted"
            onClick={() => preset(days)}
            type="button"
          >
            Last {days} days
          </button>
        ))}
      </div>
      {loading && !analytics ? (
        <p className="mt-8 text-muted-foreground">Loading analytics...</p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {[
              ["Revenue", money(analytics?.summary.revenueCents ?? 0)],
              ["Orders", analytics?.summary.orderCount ?? 0],
              ["Paid orders", analytics?.summary.paidOrderCount ?? 0],
              ["Units sold", analytics?.summary.unitsSold ?? 0],
              ["Avg order", money(analytics?.summary.avgOrderCents ?? 0)],
            ].map(([label, value]) => (
              <Card key={String(label)} className="p-5">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl">{value}</p>
              </Card>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {[
              ["Catalog", analytics?.inventory.total ?? 0],
              ["Published", analytics?.inventory.published ?? 0],
              ["Drafts", analytics?.inventory.draft ?? 0],
              ["Low stock", analytics?.inventory.lowStock ?? 0],
            ].map(([label, value]) => (
              <Card key={String(label)} className="p-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl">{value}</p>
              </Card>
            ))}
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-medium">Revenue by agency</h2>
              <BarList
                items={(analytics?.byAgency || []).map((row) => ({
                  label: row.name,
                  value: row.revenueCents,
                  display: `${money(row.revenueCents)} · ${row.orderCount} orders`,
                }))}
              />
            </Card>
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-medium">Revenue by day</h2>
              <BarList
                items={(analytics?.revenueByDay || []).map((row) => ({
                  label: row.date,
                  value: row.revenueCents,
                  display: money(row.revenueCents),
                }))}
              />
            </Card>
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-medium">Top products</h2>
              <BarList
                items={(analytics?.topProducts || []).map((row) => ({
                  label: `${row.name} (${row.quantity})`,
                  value: row.revenueCents,
                  display: money(row.revenueCents),
                }))}
              />
            </Card>
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-medium">Sales by category</h2>
              <BarList
                items={(analytics?.byCategory || []).map((row) => ({
                  label: row.category,
                  value: row.revenueCents,
                  display: money(row.revenueCents),
                }))}
              />
            </Card>
            <Card className="p-6 lg:col-span-2">
              <h2 className="mb-4 text-lg font-medium">Orders by status</h2>
              <BarList
                items={(analytics?.ordersByStatus || []).map((row) => ({
                  label: row.status,
                  value: row.count,
                  display: `${row.count} · ${money(row.revenueCents)}`,
                }))}
              />
            </Card>
          </div>
        </>
      )}
    </SuperShell>
  );
}
