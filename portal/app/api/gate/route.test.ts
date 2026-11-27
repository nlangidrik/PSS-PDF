import { beforeEach, describe, expect, it, vi } from "vitest";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { GET } from "./route";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

const staff = {
  id: "user-1",
  email: "staff@pss.edu.mh",
  name: "Staff",
  role: "USER",
  isActive: true,
  deletedAt: null,
};

describe("GET /api/gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ALLOWED_GOOGLE_DOMAIN = "pss.edu.mh";
  });

  it("returns 204 for an active user on the PSS domain", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: staff.email, name: staff.name, id: staff.id, role: staff.role },
      expires: "2099-01-01",
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(staff as never);

    const response = await GET();

    expect(response.status).toBe(204);
    expect(response.headers.get("X-PSS-User-Email")).toBe(staff.email);
    expect(response.headers.get("X-PSS-User-Role")).toBe("USER");
  });

  it("returns 401 when there is no session", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(await response.text()).toBe("");
  });

  it("returns 401 when the email is outside the PSS domain", async () => {
    const outsider = { ...staff, email: "person@gmail.com" };
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: outsider.email, name: outsider.name, id: outsider.id, role: outsider.role },
      expires: "2099-01-01",
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(outsider as never);

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it("returns 401 when the user is inactive", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: staff.email, name: staff.name, id: staff.id, role: staff.role },
      expires: "2099-01-01",
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...staff, isActive: false } as never);

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it("returns 401 when the user is soft-deleted", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: staff.email, name: staff.name, id: staff.id, role: staff.role },
      expires: "2099-01-01",
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...staff,
      deletedAt: new Date(),
    } as never);

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it("returns 401 when the user is missing from the database", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: staff.email, name: staff.name, id: staff.id, role: staff.role },
      expires: "2099-01-01",
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
  });
});
