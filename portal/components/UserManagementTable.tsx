"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROTECTED_ADMIN_EMAIL } from "@/lib/protected-admin";
import { withBasePath } from "@/lib/base-path";

type PortalUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
};

export default function UserManagementTable() {
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch(withBasePath("/api/admin/list-users"));
    const data = (await res.json()) as { users?: PortalUser[] };
    setUsers(data.users ?? []);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial user list comes from the API
    void load();
  }, []);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => user.name.toLowerCase().includes(query) || user.email.includes(query));
  }, [users, search]);

  const patchUser = async (email: string, body: { role?: string; isActive?: boolean }) => {
    setLoading(true);
    setMessage("");
    const res = await fetch(withBasePath("/api/admin/update-user"), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, ...body }),
    });
    const data = (await res.json()) as { message?: string };
    setMessage(res.ok ? "Saved" : data.message || "Update failed");
    if (res.ok) await load();
    setLoading(false);
  };

  const removeUser = async (email: string) => {
    if (!window.confirm(`Soft-delete ${email}? They will be signed out of the editor.`)) return;
    setLoading(true);
    setMessage("");
    const res = await fetch(withBasePath("/api/admin/delete-user"), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await res.json()) as { message?: string };
    setMessage(res.ok ? "User removed" : data.message || "Delete failed");
    if (res.ok) await load();
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search name or email"
        aria-label="Search users"
      />
      {message && <p className="text-sm">{message}</p>}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Active</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((user) => {
              const locked = user.email === PROTECTED_ADMIN_EMAIL;
              return (
                <tr key={user.id} className="border-t">
                  <td className="px-3 py-2">{user.name}</td>
                  <td className="px-3 py-2">{user.email}</td>
                  <td className="px-3 py-2">
                    <select
                      value={user.role}
                      disabled={loading || locked}
                      className="rounded border px-2 py-1"
                      onChange={(event) => void patchUser(user.email, { role: event.target.value })}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={loading || locked}
                      onClick={() => void patchUser(user.email, { isActive: !user.isActive })}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={loading || locked}
                      onClick={() => void removeUser(user.email)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
