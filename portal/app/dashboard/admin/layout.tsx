"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminSectionLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = session?.user?.role;

  useEffect(() => {
    if (status === "authenticated" && role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [status, role, router]);

  if (status !== "authenticated" || role !== "ADMIN") return null;
  return <>{children}</>;
}
