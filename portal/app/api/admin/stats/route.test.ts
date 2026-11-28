import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth-helpers", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/server/admin-stats", () => ({
  getAdminStats: vi.fn(),
}));

import { requireAdmin } from "@/lib/auth-helpers";
import { getAdminStats } from "@/lib/server/admin-stats";
import { GET } from "./route";

describe("GET /api/admin/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a caller who is not an admin", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(403);
    expect(getAdminStats).not.toHaveBeenCalled();
  });

  it("returns the stats for an admin", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ id: "admin", role: "ADMIN" } as never);
    vi.mocked(getAdminStats).mockResolvedValue({ users: { total: 1, activeThisMonth: 1 } } as never);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ users: { total: 1 } });
  });
});
