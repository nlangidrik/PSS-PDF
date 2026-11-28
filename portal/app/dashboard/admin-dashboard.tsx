import Link from "next/link";
import type { AdminStats } from "@/lib/server/admin-stats";
import RecentActivity, { type ActivityPage } from "./recent-activity";

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

function Card({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <section className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#003366] dark:text-white">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </section>
  );
}

export default function AdminDashboard({
  editorUrl,
  name,
  email,
  stats,
  activity,
}: {
  editorUrl: string;
  name: string;
  email: string;
  stats: AdminStats;
  activity: ActivityPage;
}) {
  const peak = Math.max(...stats.perDay.map((day) => day.count), 0);

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#003366] dark:text-white">BytePaper</h1>
          <p className="mt-2 text-muted-foreground">
            {name} · {email}
          </p>
        </div>
        <a
          href={editorUrl}
          className="inline-flex h-12 items-center justify-center rounded-lg bg-[#003366] px-6 text-base font-semibold text-white hover:bg-[#004080]"
        >
          Open PDF Editor
        </a>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card
          label="Users"
          value={stats.users.total.toLocaleString()}
          detail={`${stats.users.activeThisMonth.toLocaleString()} signed in this month`}
        />
        <Card
          label="Logins"
          value={stats.logins.today.toLocaleString()}
          detail={`${stats.logins.thisWeek.toLocaleString()} this week · ${stats.logins.thisMonth.toLocaleString()} this month`}
        />
        <Card
          label="Files processed"
          value={stats.toolRunsReported ? stats.files.processedThisMonth.toLocaleString() : "—"}
          detail={
            stats.toolRunsReported
              ? `${stats.files.processedAllTime.toLocaleString()} all time · ${stats.files.note}`
              : stats.files.note
          }
        />
        <Card
          label="Storage"
          value={stats.toolRunsReported ? formatBytes(stats.storage.processedThisMonthBytes) : "—"}
          detail={
            stats.toolRunsReported
              ? `Input size this month. ${stats.storage.note}`
              : stats.storage.note
          }
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Files processed, last 30 days</h2>
        {stats.toolRunsReported ? (
          <div className="rounded-lg border p-4">
            <div className="flex h-36 items-end gap-1">
              {stats.perDay.map((day) => (
                <div key={day.date} className="flex h-full flex-1 items-end" title={`${day.date}: ${day.count}`}>
                  <div
                    className="w-full rounded-t bg-[#003366]"
                    style={{ height: peak === 0 ? "0%" : `${Math.max((day.count / peak) * 100, day.count > 0 ? 8 : 0)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{stats.perDay[0]?.date}</span>
              <span>{stats.perDay[stats.perDay.length - 1]?.date}</span>
            </div>
          </div>
        ) : (
          <p className="rounded-lg border px-4 py-8 text-sm text-muted-foreground">No files processed yet.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Top tools this month</h2>
        {stats.topTools.length > 0 ? (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {stats.topTools.map((tool) => (
              <li key={tool.tool} className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm">
                <span>{tool.tool}</span>
                <span className="font-medium">{tool.count.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border px-4 py-8 text-sm text-muted-foreground">No files processed yet.</p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <Link href="/dashboard/admin/audit-logs" className="text-sm font-medium text-[#003366] hover:underline">
            Full activity
          </Link>
        </div>
        {!stats.toolRunsReported ? (
          <p className="text-sm text-muted-foreground">
            These are sign-ins and admin changes. File name and size show up when a tool run is reported.
          </p>
        ) : null}
        <RecentActivity initial={activity} />
      </section>
    </div>
  );
}
