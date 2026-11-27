import UserManagementTable from "@/components/UserManagementTable";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Users</h1>
      <UserManagementTable />
    </div>
  );
}
