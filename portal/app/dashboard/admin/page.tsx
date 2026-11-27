import Link from "next/link";

const LINKS = [
  { href: "/dashboard/admin/users", title: "Users", detail: "Roles, access, and removal" },
  { href: "/dashboard/admin/audit-logs", title: "Activity", detail: "Sign-ins and admin changes" },
  { href: "/dashboard/admin/settings", title: "Settings", detail: "SMTP for portal mail" },
];

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Administration</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-lg border p-5 hover:border-[#003366]">
            <h2 className="font-medium">{link.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{link.detail}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
