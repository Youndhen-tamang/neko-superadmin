"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SuperShell } from "@/components/layout/super-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader, Skeleton } from "@/components/ui/page-loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Agency, Product, api } from "@/lib/api";
import { money } from "@/lib/utils";

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [agencyId, setAgencyId] = useState(searchParams.get("agencyId") || "");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  function load(nextAgencyId = agencyId) {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (nextAgencyId) params.set("agencyId", nextAgencyId);
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    const query = params.toString();
    setLoading(true);
    api<{ products: Product[] }>(`/api/products${query ? `?${query}` : ""}`)
      .then((data) => setProducts(data.products))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    api<{ agencies: Agency[] }>("/api/super-admin/agencies")
      .then((data) => setAgencies(data.agencies))
      .catch((error) => toast.error(error.message));
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agencyId, category, status]);

  const categories = useMemo(
    () =>
      [...new Set(products.map((product) => product.category).filter((value): value is string => Boolean(value)))].sort(),
    [products]
  );

  return (
    <SuperShell>
      <div>
        <h1 className="text-3xl font-medium">Products</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit or delete catalog items across every agency.
        </p>
      </div>
      <form
        className="mt-6 grid gap-3 rounded-xl border bg-card p-4 lg:grid-cols-[1fr_180px_160px_140px_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <Input placeholder="Search name, description, category" value={q} onChange={(e) => setQ(e.target.value)} />
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
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>
      <div className="mt-6 rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Agency</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={9}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {!loading && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-muted-foreground">
                  No products match these filters.
                </TableCell>
              </TableRow>
            )}
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="font-medium">{product.name}</div>
                  <div className="mt-1 line-clamp-2 max-w-md text-xs text-muted-foreground">
                    {product.description || "No description"}
                  </div>
                </TableCell>
                <TableCell>
                  <div>{product.agency_name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{product.agency_slug}</div>
                </TableCell>
                <TableCell>{product.category || "—"}</TableCell>
                <TableCell>{money(product.price_cents)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.like_count ?? 0}</TableCell>
                <TableCell>{product.comment_count ?? 0}</TableCell>
                <TableCell>
                  <Badge>{product.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/super-admin/products/${product.id}`}>Edit</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) return;
                        try {
                          await api(`/api/products/${product.id}`, { method: "DELETE" });
                          toast.success("Product deleted");
                          load();
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Could not delete");
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </SuperShell>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <SuperShell>
          <PageLoader label="Loading products" />
        </SuperShell>
      }
    >
      <ProductsPageInner />
    </Suspense>
  );
}
