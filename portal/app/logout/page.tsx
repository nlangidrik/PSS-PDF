"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { withBasePath } from "@/lib/base-path";

export default function LogoutPage() {
  useEffect(() => {
    const leave = async () => {
      try {
        await fetch(withBasePath("/api/logout"), { method: "POST" });
      } catch (error) {
        console.error("[LOGOUT]", error);
      }
      await signOut({ callbackUrl: withBasePath("/") });
    };
    void leave();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1628] text-white">
      <p>Signing out…</p>
    </div>
  );
}
