import { beforeEach, describe, expect, it, vi } from "vitest";

const tx = {
  auditEvent: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock("@/lib/auth-helpers", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(async (run: (client: typeof tx) => Promise<unknown>) => run(tx)),
  },
}));

import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { GET } from "./route";

function request(query: string) {
  return new Request(`http://localhost/portal/api/admin/audit-logs${query}`);
}

describe("GET /api/admin/audit-logs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({ id: "admin", role: "ADMIN" } as never);
    tx.auditEvent.count.mockResolvedValue(30);
    tx.auditEvent.findMany.mockResolvedValue([]);
  });

  it("rejects a caller who is not an admin", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(null);

    const response = await GET(request(""));

    expect(response.status).toBe(403);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("reads one page and the total inside a single transaction", async () => {
    tx.auditEvent.count.mockResolvedValue(312);
    const response = await GET(request("?page=2&size=50"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(tx.auditEvent.count).toHaveBeenCalledOnce();
    expect(tx.auditEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { occurredAt: "desc" },
        skip: 50,
        take: 50,
      }),
    );
    expect(body).toMatchObject({ total: 312, page: 2, size: 50 });
  });

  it("clamps a page past the end and rejects a non-number as page 1", async () => {
    const tooFar = await GET(request("?page=9999&size=25"));
    expect(tx.auditEvent.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ skip: 25, take: 25 }),
    );
    await expect(tooFar.json()).resolves.toMatchObject({ page: 2, size: 25, total: 30 });

    const nonsense = await GET(request("?page=abc&size=7"));
    expect(tx.auditEvent.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ skip: 0, take: 25 }),
    );
    await expect(nonsense.json()).resolves.toMatchObject({ page: 1, size: 25 });

    const zero = await GET(request("?page=0"));
    expect(tx.auditEvent.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ skip: 0, take: 25 }),
    );
    await expect(zero.json()).resolves.toMatchObject({ page: 1, size: 25 });
  });

  it("accepts a page of 10 and clamps an out-of-range activity page", async () => {
    tx.auditEvent.count.mockResolvedValue(30);

    const tooFar = await GET(request("?page=9999&size=10"));
    expect(tx.auditEvent.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ skip: 20, take: 10 }),
    );
    await expect(tooFar.json()).resolves.toMatchObject({ page: 3, size: 10, total: 30 });

    const zero = await GET(request("?page=0&size=10"));
    expect(tx.auditEvent.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ skip: 0, take: 10 }),
    );
    await expect(zero.json()).resolves.toMatchObject({ page: 1, size: 10 });
  });

  it("treats To as the end of that day in Pacific/Majuro", async () => {
    const response = await GET(request("?from=2026-11-28&to=2026-11-28"));

    expect(response.status).toBe(200);
    expect(tx.auditEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          occurredAt: {
            gte: new Date("2026-11-27T12:00:00.000Z"),
            lte: new Date("2026-11-28T11:59:59.999Z"),
          },
        },
      }),
    );
  });
});
