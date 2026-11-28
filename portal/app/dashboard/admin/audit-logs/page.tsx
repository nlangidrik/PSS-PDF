import { Suspense } from "react";
import ActivityLog from "./activity-log";

export default function AuditLogsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading activity…</p>}>
      <ActivityLog />
    </Suspense>
  );
}
