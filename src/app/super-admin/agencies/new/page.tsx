"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SuperShell } from "@/components/layout/super-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function NewAgencyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
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
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <SuperShell>
      <h1 className="text-3xl font-medium">Create agency</h1>
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
            toast.success("Agency created");
            router.push("/super-admin/agencies");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not create agency");
          } finally {
            setLoading(false);
          }
        }}
      >
        {[
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
        ].map(([key, label]) => (
          <div key={key} className="space-y-2">
            <Label>{label}</Label>
            <Input
              type={key.includes("Password") ? "password" : key.includes("email") || key === "email" ? "email" : "text"}
              value={form[key as keyof typeof form]}
              onChange={(e) => set(key as keyof typeof form, e.target.value)}
              required={["name", "slug", "brandName", "adminName", "adminEmail", "adminPassword"].includes(key)}
            />
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
    </SuperShell>
  );
}
