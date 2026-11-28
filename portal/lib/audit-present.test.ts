import { describe, expect, it } from "vitest";
import { presentAuditEvent } from "./audit-present";

describe("presentAuditEvent", () => {
  it("uses the display name and a friendly action instead of the raw event code", () => {
    const row = presentAuditEvent({
      id: "evt-1",
      eventType: "ADMIN_LOGIN",
      actorEmail: "admin@pss.edu.mh",
      actorName: "BytePaper Admin",
      targetEmail: null,
      occurredAt: "2026-11-27T20:00:00.000Z",
    });

    expect(row.user).toBe("BytePaper Admin");
    expect(row.action).toBe("Signed in");
    expect(row.fileName).toBeNull();
    expect(row.fileSizeBytes).toBeNull();
  });
});
