"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { withBasePath } from "@/lib/base-path";
import { formatMajuro } from "@/lib/server/majuro-time";

const EVENTS = [
  "",
  "SIGN_IN",
  "SIGN_IN_DENIED",
  "SIGN_OUT",
  "ADMIN_LOGIN",
  "USER_ROLE_CHANGED",
  "USER_ACTIVATED",
  "USER_DEACTIVATED",
  "USER_SOFT_DELETED",
];

const PAGE_SIZES = [25, 50, 100];

type AuditRow = {
  id: string;
  eventType: string;
  occurredAt: string;
  actorEmail: string | null;
  targetEmail: string | null;
  ipAddress: string | null;
};

type PageToken = number | "gap";

function pageTokens(current: number, pages: number): PageToken[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1);
  const wanted = [1, pages, current - 1, current, current + 1].filter(
    (page) => page >= 1 && page <= pages,
  );
  const unique = [...new Set(wanted)].sort((left, right) => left - right);
  const tokens: PageToken[] = [];
  unique.forEach((page, index) => {
    if (index > 0 && page - unique[index - 1] > 1) tokens.push("gap");
    tokens.push(page);
  });
  return tokens;
}

function queryHref(
  pathname: string,
  filters: { email: string; event: string; from: string; to: string },
  page: number,
  size: number,
) {
  const params = new URLSearchParams();
  if (filters.email) params.set("email", filters.email);
  if (filters.event) params.set("event", filters.event);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (page > 1) params.set("page", String(page));
  if (size !== 25) params.set("size", String(size));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function FilterForm({
  initial,
  onApply,
}: {
  initial: { email: string; event: string; from: string; to: string };
  onApply: (filters: { email: string; event: string; from: string; to: string }) => void;
}) {
  const [email, setEmail] = useState(initial.email);
  const [event, setEvent] = useState(initial.event);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);

  const onSubmit = (formEvent: FormEvent) => {
    formEvent.preventDefault();
    onApply({ email: email.trim(), event, from, to });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-5">
      <div className="space-y-1">
        <Label htmlFor="email">User</Label>
        <Input id="email" value={email} onChange={(change) => setEmail(change.target.value)} placeholder="email" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="event">Event</Label>
        <select
          id="event"
          className="flex h-10 w-full rounded-md border px-3 text-sm"
          value={event}
          onChange={(change) => setEvent(change.target.value)}
        >
          {EVENTS.map((value) => (
            <option key={value || "all"} value={value}>
              {value || "All events"}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="from">From</Label>
        <Input id="from" type="date" value={from} onChange={(change) => setFrom(change.target.value)} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="to">To</Label>
        <Input id="to" type="date" value={to} onChange={(change) => setTo(change.target.value)} />
      </div>
      <div className="flex items-end">
        <Button type="submit" className="bg-[#003366] hover:bg-[#004080]">
          Filter
        </Button>
      </div>
    </form>
  );
}

export default function ActivityLog() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const queryKey = searchParams.toString();

  const [rows, setRows] = useState<AuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(queryKey);
    const filters = {
      email: params.get("email")?.trim() ?? "",
      event: params.get("event")?.trim() ?? "",
      from: params.get("from")?.trim() ?? "",
      to: params.get("to")?.trim() ?? "",
    };
    const controller = new AbortController();
    const request = new URLSearchParams();
    if (filters.email) request.set("email", filters.email);
    if (filters.event) request.set("event", filters.event);
    if (filters.from) request.set("from", filters.from);
    if (filters.to) request.set("to", filters.to);
    const requestedPage = params.get("page");
    const requestedSize = params.get("size");
    if (requestedPage) request.set("page", requestedPage);
    if (requestedSize) request.set("size", requestedSize);

    void (async () => {
      setLoading(true);
      try {
        const res = await fetch(withBasePath(`/api/admin/audit-logs?${request.toString()}`), {
          signal: controller.signal,
        });
        const data = (await res.json()) as {
          events?: AuditRow[];
          total?: number;
          page?: number;
          size?: number;
          message?: string;
        };
        if (!res.ok) {
          setMessage(data.message || "Could not load activity");
          setRows([]);
          setTotal(0);
          return;
        }
        const nextPage = data.page ?? 1;
        const nextSize = data.size ?? 25;
        setMessage("");
        setRows(data.events ?? []);
        setTotal(data.total ?? 0);
        setPage(nextPage);
        setSize(nextSize);
        const canonical = queryHref(pathname, filters, nextPage, nextSize);
        const current = queryKey ? `${pathname}?${queryKey}` : pathname;
        if (canonical !== current) router.replace(canonical);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setMessage("Could not load activity");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [pathname, queryKey, router]);

  const go = (
    filters: { email: string; event: string; from: string; to: string },
    nextPage: number,
    nextSize: number,
  ) => {
    router.push(queryHref(pathname, filters, nextPage, nextSize));
  };

  const pages = Math.max(1, Math.ceil(total / size));
  const start = total === 0 ? 0 : (page - 1) * size + 1;
  const end = total === 0 ? 0 : Math.min(page * size, total);
  const filters = {
    email: searchParams.get("email")?.trim() ?? "",
    event: searchParams.get("event")?.trim() ?? "",
    from: searchParams.get("from")?.trim() ?? "",
    to: searchParams.get("to")?.trim() ?? "",
  };
  const onFirst = page <= 1;
  const onLast = page >= pages;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Activity</h1>
      <FilterForm key={queryKey} initial={filters} onApply={(next) => go(next, 1, size)} />
      {message ? <p className="text-sm text-red-600">{message}</p> : null}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Event</th>
              <th className="px-3 py-2">Actor</th>
              <th className="px-3 py-2">Target</th>
              <th className="px-3 py-2">IP</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-muted-foreground">
                  {loading ? "Loading activity…" : "No activity matches these filters."}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-3 py-2 whitespace-nowrap">{formatMajuro(new Date(row.occurredAt))}</td>
                  <td className="px-3 py-2">{row.eventType}</td>
                  <td className="px-3 py-2">{row.actorEmail}</td>
                  <td className="px-3 py-2">{row.targetEmail}</td>
                  <td className="px-3 py-2">{row.ipAddress}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {total === 0 ? "Showing 0 of 0 events" : `Showing ${start}–${end} of ${total} events`}
        </p>
        <label className="flex items-center gap-2 text-sm">
          Rows
          <select
            aria-label="Rows per page"
            className="h-10 rounded-md border px-3 text-sm"
            value={size}
            onChange={(change) => go(filters, page, Number(change.target.value))}
          >
            {PAGE_SIZES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <Button type="button" variant="outline" size="sm" disabled={onFirst} onClick={() => go(filters, 1, size)}>
          « First
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={onFirst} onClick={() => go(filters, page - 1, size)}>
          ‹ Prev
        </Button>
        {pageTokens(page, pages).map((token, index) =>
          token === "gap" ? (
            <span key={`gap-${index}`} className="px-2 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={token}
              type="button"
              variant={token === page ? "default" : "outline"}
              size="sm"
              className={token === page ? "bg-[#003366] hover:bg-[#004080]" : undefined}
              aria-current={token === page ? "page" : undefined}
              onClick={() => go(filters, token, size)}
            >
              {token}
            </Button>
          ),
        )}
        <Button type="button" variant="outline" size="sm" disabled={onLast} onClick={() => go(filters, page + 1, size)}>
          Next ›
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={onLast} onClick={() => go(filters, pages, size)}>
          Last »
        </Button>
      </div>
    </div>
  );
}
