"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { BASE_PATH } from "@/lib/base-path";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath={`${BASE_PATH}/api/auth`}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
}
