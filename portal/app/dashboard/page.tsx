import DashboardHome from "./dashboard-home";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const editorUrl = process.env.EDITOR_PUBLIC_URL?.trim() || "/";
  return <DashboardHome editorUrl={editorUrl} />;
}
