import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import LandingClient from "@/components/LandingClient";
import { editorPublicUrl, staffPasswordLoginEnabled } from "@/lib/staff-login";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) redirect(editorPublicUrl());
  return (
    <LandingClient
      passwordLogin={staffPasswordLoginEnabled()}
      afterLoginUrl={editorPublicUrl()}
    />
  );
}
