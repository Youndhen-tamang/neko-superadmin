"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SuperShell } from "@/components/layout/super-shell";
import { CommentThread } from "@/components/comments/comment-thread";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/page-loader";
import { Agency, ProductComment, api } from "@/lib/api";

export default function CommentsPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [comments, setComments] = useState<ProductComment[]>([]);
  const [q, setQ] = useState("");
  const [agencyId, setAgencyId] = useState("");
  const [loading, setLoading] = useState(true);

  function load(nextAgencyId = agencyId) {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (nextAgencyId) params.set("agencyId", nextAgencyId);
    const query = params.toString();
    setLoading(true);
    api<{ comments: ProductComment[] }>(`/api/engagement${query ? `?${query}` : ""}`)
      .then((data) => setComments(data.comments))
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

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agencyId]);

  return (
    <SuperShell>
      <div>
        <h1 className="text-3xl font-medium">Likes & comments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review invoice-verified comments across every agency, including nested replies.
        </p>
      </div>
      <form
        className="mt-6 grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_200px_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <Input
          placeholder="Search comments, invoices, authors, or products"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
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
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>
      <div className="mt-6">
        {loading ? (
          <PageLoader label="Loading comments" />
        ) : (
          <CommentThread comments={comments} onDeleted={() => load()} showProduct showAgency />
        )}
      </div>
    </SuperShell>
  );
}
