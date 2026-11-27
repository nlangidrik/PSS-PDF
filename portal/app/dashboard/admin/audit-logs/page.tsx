"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { withBasePath } from "@/lib/base-path";

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

type AuditRow = {
  id: string;
  eventType: string;
  occurredAt: string;
  actorEmail: string | null;
  targetEmail: string | null;
  ipAddress: string | null;
  metadata: unknown;
};

export default function AuditLogsPage() {
  const [email, setEmail] = useState("");
  const [event, setEvent] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [message, setMessage] = useState("");

  const load = async (filters: { email: string; event: string; from: string; to: string }) => {
    const params = new URLSearchParams();
    if (filters.email) params.set("email", filters.email);
    if (filters.event) params.set("event", filters.event);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    const res = await fetch(withBasePath(`/api/admin/audit-logs?${params.toString()}`));
    const data = (await res.json()) as { events?: AuditRow[]; message?: string };
    if (!res.ok) {
      setMessage(data.message || "Could not load activity");
      return;
    }
    setMessage("");
    setRows(data.events ?? []);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial activity list comes from the API
    void load({ email: "", event: "", from: "", to: "" });
  }, []);

  const onSubmit = (formEvent: FormEvent) => {
    formEvent.preventDefault();
    void load({ email, event, from, to });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Activity</h1>
      <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-5">
        <div className="space-y-1">
          <Label htmlFor="email">User</Label>
          <Input id="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email" />
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
          <Input id="from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="to">To</Label>
          <Input id="to" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </div>
        <div className="flex items-end">
          <Button type="submit" className="bg-[#003366] hover:bg-[#004080]">
            Filter
          </Button>
        </div>
      </form>
      {message && <p className="text-sm text-red-600">{message}</p>}
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
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="px-3 py-2 whitespace-nowrap">{new Date(row.occurredAt).toLocaleString()}</td>
                <td className="px-3 py-2">{row.eventType}</td>
                <td className="px-3 py-2">{row.actorEmail}</td>
                <td className="px-3 py-2">{row.targetEmail}</td>
                <td className="px-3 py-2">{row.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
