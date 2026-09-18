"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Building2, LayoutDashboard, LogOut } from "lucide-react";
import { clearToken, getToken } from "@/lib/api";
import { cn } from "@/lib/utils";

const links = [
  { href: "/super-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin/agencies", label: "Agencies", icon: Building2 },
];

export function SuperShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) router.replace("/super-admin/login");
  }, [router]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-border bg-card lg:border-b-0 lg:border-r">
        <div className="px-5 py-6">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Control plane</p>
          <p className="mt-1 text-lg font-medium">Super admin</p>
        </div>
        <nav className="flex gap-1 px-3 pb-4 lg:flex-col">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                pathname === link.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          <button
            className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-muted-foreground"
            onClick={() => {
              clearToken();
              router.push("/super-admin/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </nav>
      </aside>
      <div className="p-8">{children}</div>
    </div>
  );
}
