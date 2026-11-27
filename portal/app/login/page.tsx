import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { resolveCallbackUrl } from "@/lib/callback-url";
import LoginClient from "@/components/LoginClient";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const nextAuthUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3002/portal";
  const destination = resolveCallbackUrl(params.callbackUrl, nextAuthUrl);
  const session = await getServerSession(authOptions);
  if (session) redirect(destination);
  return <LoginClient callbackUrl={params.callbackUrl ?? "/dashboard"} />;
}
