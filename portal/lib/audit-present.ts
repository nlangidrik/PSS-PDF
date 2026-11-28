import { formatMajuro } from "@/lib/server/majuro-time";

const ACTION_LABEL: Record<string, string> = {
  SIGN_IN: "Signed in",
  ADMIN_LOGIN: "Signed in",
  SIGN_IN_DENIED: "Sign-in denied",
  SIGN_OUT: "Signed out",
  USER_ROLE_CHANGED: "Role changed",
  USER_ACTIVATED: "User activated",
  USER_DEACTIVATED: "User deactivated",
  USER_SOFT_DELETED: "User removed",
};

export type PresentedAuditRow = {
  id: string;
  user: string;
  action: string;
  fileName: string | null;
  fileSizeBytes: number | null;
  occurredAt: string;
};

export function presentAuditEvent(event: {
  id: string;
  eventType: string;
  actorEmail: string | null;
  actorName: string | null;
  targetEmail: string | null;
  occurredAt: Date | string;
}): PresentedAuditRow {
  const label = ACTION_LABEL[event.eventType] ?? event.eventType;
  const action =
    event.targetEmail && event.targetEmail !== event.actorEmail ? `${label} · ${event.targetEmail}` : label;
  const occurredAt = event.occurredAt instanceof Date ? event.occurredAt : new Date(event.occurredAt);
  return {
    id: event.id,
    user: event.actorName || event.actorEmail || "Unknown",
    action,
    fileName: null,
    fileSizeBytes: null,
    occurredAt: formatMajuro(occurredAt),
  };
}
