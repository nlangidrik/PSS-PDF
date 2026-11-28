"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { presentAuditEvent, type PresentedAuditRow } from "@/lib/audit-present";
import { withBasePath } from "@/lib/base-path";
import { parseActivityPage } from "@/lib/server/activity-page";

const PAGE_SIZE = 10;

export type ActivityPage = {
  rows: PresentedAuditRow[];
  total: number;
  page: number;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = value >= 10 ? value.toFixed(0) : value.toFixed(1);
  return `${rounded} ${units[unit]}`;
}

function writeActivityPage(page: number, mode: "push" | "replace") {
  const url = new URL(window.location.href);
  if (page <= 1) url.searchParams.delete("activityPage");
  else url.searchParams.set("activityPage", String(page));
  const next = `${url.pathname}${url.search}${url.hash}`;
  if (mode === "push") history.pushState(null, "", next);
  else history.replaceState(null, "", next);
}

export default function RecentActivity({ initial }: { initial: ActivityPage }) {
  const [rows, setRows] = useState(initial.rows);
  const [total, setTotal] = useState(initial.total);
  const [page, setPage] = useState(initial.page);
  const [message, setMessage] = useState("");
  const requestId = useRef(0);

  const load = async (nextPage: number, historyMode: "push" | "replace" | "none") => {
    const id = ++requestId.current;
    try {
      const res = await fetch(withBasePath(`/api/admin/audit-logs?page=${nextPage}&size=${PAGE_SIZE}`));
      const data = (await res.json()) as {
        events?: Array<Parameters<typeof presentAuditEvent>[0]>;
        total?: number;
        page?: number;
        message?: string;
      };
      if (id !== requestId.current) return;
      if (!res.ok) {
        setMessage(data.message || "Could not load activity");
        return;
      }
      const resolvedPage = data.page ?? 1;
      setMessage("");
      setRows((data.events ?? []).map(presentAuditEvent));
      setTotal(data.total ?? 0);
      setPage(resolvedPage);
      if (historyMode !== "none") writeActivityPage(resolvedPage, historyMode);
    } catch {
      if (id !== requestId.current) return;
      setMessage("Could not load activity");
    }
  };

  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("activityPage");
    const shown = initial.page > 1 ? String(initial.page) : null;
    const current = raw && raw !== "1" ? raw : null;
    if (shown !== current) writeActivityPage(initial.page, "replace");
  }, [initial.page]);

  useEffect(() => {
    const onPop = () => {
      const raw = new URLSearchParams(window.location.search).get("activityPage");
      void loadRef.current(parseActivityPage(raw), "none");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-3">
      {message ? <p className="text-sm text-red-600">{message}</p> : null}
      {rows.length === 0 ? (
        <p className="rounded-lg border px-4 py-8 text-sm text-muted-foreground">No activity yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[36rem] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2 font-medium">User</th>
                <th className="px-3 py-2 font-medium">Action</th>
                <th className="px-3 py-2 font-medium">File</th>
                <th className="px-3 py-2 font-medium">Size</th>
                <th className="px-3 py-2 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-3 py-2">{row.user}</td>
                  <td className="px-3 py-2">{row.action}</td>
                  <td className="px-3 py-2">{row.fileName ?? "—"}</td>
                  <td className="px-3 py-2">{row.fileSizeBytes === null ? "—" : formatBytes(row.fileSizeBytes)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.occurredAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {total === 0 ? "Showing 0 of 0" : `Showing ${start}–${end} of ${total}`}
        </p>
        <div className="flex flex-wrap gap-1">
          <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => void load(page - 1, "push")}>
            ‹ Prev
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={page >= pages} onClick={() => void load(page + 1, "push")}>
            Next ›
          </Button>
        </div>
      </div>
    </div>
  );
}
