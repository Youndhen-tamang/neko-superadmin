"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { SuperShell } from "@/components/layout/super-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLoader } from "@/components/ui/page-loader";
import { PasswordInput } from "@/components/ui/password-input";
import { api } from "@/lib/api";
import type { TenantRequest } from "@/lib/tenant-requests";

const emptyForm = {
  name: "",
  slug: "",
  brandName: "",
  email: "",
  phone: "",
  address: "",
  tagline: "",
  primaryColor: "#1f6b4a",
  adminName: "",
  adminEmail: "",
  adminPassword: "",
};

const fields: [keyof typeof emptyForm, string][] = [
  ["name", "Agency name"],
  ["slug", "Slug"],
  ["brandName", "Brand name"],
  ["tagline", "Tagline"],
  ["email", "Agency email"],
  ["phone", "Phone"],
  ["address", "Address"],
  ["adminName", "Admin name"],
  ["adminEmail", "Admin email"],
  ["adminPassword", "Admin password"],
];

function NewAgencyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");
  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(Boolean(requestId));
  const [sourceRequest, setSourceRequest] = useState<TenantRequest | null>(null);
  const [form, setForm] = useState(emptyForm);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    if (!requestId) return;
    api<{ request: TenantRequest }>(`/api/tenant-requests/${requestId}`)
      .then(({ request }) => {
        setSourceRequest(request);
        setForm((current) => ({
          ...current,
          name: request.name,
          slug: request.slug,
          brandName: request.brandName,
          email: request.email,
          phone: request.phone,
          address: request.address,
          tagline: request.tagline,
          adminName: request.adminName,
          adminEmail: request.adminEmail,
        }));
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setPrefillLoading(false));
  }, [requestId]);

  if (prefillLoading) {
    return <PageLoader label="Loading request" />;
  }

  return (
    <>
      <h1 className="text-3xl font-medium">Create agency</h1>
      {sourceRequest ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Prefilling from request by {sourceRequest.adminName} ({sourceRequest.adminEmail}). Set an admin password, then
          create the tenant.
        </p>
      ) : null}
      <form
        className="mt-8 grid max-w-2xl gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          try {
            await api("/api/super-admin/agencies", {
              method: "POST",
              body: JSON.stringify(form),
            });
            if (requestId) {
              await api(`/api/tenant-requests/${requestId}`, {
                method: "PATCH",
                body: JSON.stringify({ status: "approved" }),
              }).catch(() => undefined);
            }
            toast.success("Agency created");
            router.push("/super-admin/agencies");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not create agency");
          } finally {
            setLoading(false);
          }
        }}
      >
        {fields.map(([key, label]) => (
          <div key={key} className="space-y-2">
            <Label>{label}</Label>
            {key === "adminPassword" ? (
              <PasswordInput
                value={form.adminPassword}
                onChange={(e) => set("adminPassword", e.target.value)}
                required
                autoComplete="new-password"
              />
            ) : (
              <Input
                type={key.includes("email") || key === "email" ? "email" : "text"}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                required={["name", "slug", "brandName", "adminName", "adminEmail"].includes(key)}
              />
            )}
          </div>
        ))}
        <div className="space-y-2">
          <Label>Primary color</Label>
          <Input type="color" value={form.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create agency"}
        </Button>
      </form>
    </>
  );
}

export default function NewAgencyPage() {
  return (
    <SuperShell>
      <Suspense fallback={<PageLoader label="Loading form" />}>
        <NewAgencyForm />
      </Suspense>
    </SuperShell>
  );
}
