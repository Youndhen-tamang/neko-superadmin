"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, setToken } from "@/lib/api";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Control plane</p>
      <h1 className="mt-3 text-4xl font-medium">Super admin</h1>
      <form
        className="mt-8 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          try {
            const data = await api<{ token: string }>("/api/auth/super-admin/login", {
              method: "POST",
              body: JSON.stringify({ email, password }),
            });
            setToken(data.token);
            router.push("/super-admin/dashboard");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Login failed");
          } finally {
            setLoading(false);
          }
        }}
      >
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Enter dashboard"}
        </Button>
      </form>
    </div>
  );
}
