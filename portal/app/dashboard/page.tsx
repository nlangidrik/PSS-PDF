import { presentAuditEvent } from "@/lib/audit-present";
import { getCurrentUser } from "@/lib/auth-helpers";
import { parseActivityPage } from "@/lib/server/activity-page";
import { getAdminStats } from "@/lib/server/admin-stats";
import { listAuditEvents } from "@/lib/server/audit-log-page";
import AdminDashboard from "./admin-dashboard";
import DashboardHome from "./dashboard-home";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ activityPage?: string }>;
}) {
  const editorUrl = process.env.EDITOR_PUBLIC_URL?.trim() || "/";
  const user = await getCurrentUser();
  if (!user) return null;

  if (user.role === "ADMIN") {
    const params = await searchParams;
    const [stats, activity] = await Promise.all([
      getAdminStats(),
      listAuditEvents({
        where: {},
        page: parseActivityPage(params.activityPage ?? null),
        pageSize: 10,
      }),
    ]);
    return (
      <AdminDashboard
        editorUrl={editorUrl}
        name={user.name}
        email={user.email}
        stats={stats}
        activity={{
          rows: activity.events.map(presentAuditEvent),
          total: activity.total,
          page: activity.page,
        }}
      />
    );
  }

  return <DashboardHome editorUrl={editorUrl} name={user.name} email={user.email} />;
}
