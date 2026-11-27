"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

const CAPABILITIES = [
  "Upload PDFs",
  "Add, delete, and reorder pages",
  "Sign",
  "Edit text",
  "Add text",
  "Redact",
];

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#003366] dark:text-white">PSS PDF</h1>
        <p className="mt-2 text-muted-foreground">
          {session?.user?.name} · {session?.user?.email}
        </p>
      </div>

      {/* Editor is served at the site root, outside this app's basePath. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/"
        className="inline-flex h-14 items-center justify-center rounded-lg bg-[#003366] px-8 text-lg font-semibold text-white hover:bg-[#004080]"
      >
        Open PDF Editor
      </a>

      <ul className="grid gap-2 text-sm">
        {CAPABILITIES.map((item) => (
          <li key={item} className="rounded-md border px-4 py-3">
            {item}
          </li>
        ))}
      </ul>

      <Link href="/logout" className="text-sm font-medium text-red-700">
        Sign out
      </Link>
    </div>
  );
}
