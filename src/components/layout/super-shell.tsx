"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, Building2, Heart, Inbox, LayoutDashboard, LogOut, Menu, Package, X } from "lucide-react";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { PageLoader } from "@/components/ui/page-loader";
import { clearToken, getToken } from "@/lib/api";
import { cn } from "@/lib/utils";

const links = [
  { href: "/super-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/super-admin/products", label: "Products", icon: Package },
  { href: "/super-admin/comments", label: "Comments", icon: Heart },
  { href: "/super-admin/agencies", label: "Agencies", icon: Building2 },
  { href: "/super-admin/requests", label: "Requests", icon: Inbox },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SuperShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/super-admin/login");
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = navOpen || signOutOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen, signOutOpen]);

  function signOut() {
    clearToken();
    router.push("/super-admin/login");
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <PageLoader label="Opening control plane" />
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Control plane</p>
          <p className="text-sm font-medium">Super admin</p>
        </div>
        <button
          type="button"
          className="rounded-md border border-border p-2 hover:bg-muted"
          onClick={() => setNavOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {navOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:z-0 lg:min-h-screen lg:w-auto lg:translate-x-0",
          navOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-start justify-between px-5 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Control plane</p>
            <p className="mt-1 text-lg font-medium">Super admin</p>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-muted-foreground hover:bg-muted lg:hidden"
            onClick={() => setNavOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 pb-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                isActive(pathname, link.href) ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            className="mt-auto flex items-center justify-center gap-2 rounded-md bg-destructive px-3 py-2 text-sm text-destructive-foreground hover:opacity-90"
            onClick={() => setSignOutOpen(true)}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </nav>
      </aside>

      <div className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</div>

      <AlertDialog
        open={signOutOpen}
        title="Sign out?"
        description="You will be signed out of the super-admin control plane and need to log in again."
        confirmLabel="Sign out"
        confirmVariant="destructive"
        onConfirm={signOut}
        onOpenChange={setSignOutOpen}
      />
    </div>
  );
}
