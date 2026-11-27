"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar, type NavGroup } from "@/components/sidebar";

const userNav: NavGroup[] = [
  {
    label: "",
    items: [{ title: "Dashboard", href: "/dashboard" }],
  },
];

const adminNav: NavGroup[] = [
  {
    label: "Admin",
    items: [
      { title: "Dashboard", href: "/dashboard" },
      { title: "Users", href: "/dashboard/admin/users" },
      { title: "Activity", href: "/dashboard/admin/audit-logs" },
      { title: "Settings", href: "/dashboard/admin/settings" },
    ],
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const mustChangePassword = session?.user?.mustChangePassword;
  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (mustChangePassword && pathname !== "/dashboard/profile/password") {
      router.replace("/dashboard/profile/password?forcePasswordChange=1");
    }
  }, [mustChangePassword, pathname, router]);

  if (status !== "authenticated") return null;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
      <Sidebar navGroups={isAdmin ? adminNav : userNav} isAdmin={isAdmin} />
      <main className="flex-1 bg-white dark:bg-slate-950 p-4 pt-16 md:p-6 lg:p-8 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
