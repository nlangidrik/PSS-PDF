"use client";

import { signIn } from "next-auth/react";
import { APP_NAME, ORG_NAME } from "@/lib/brand";
import { PssLogo } from "@/components/pss-logo";

export default function LoginClient({ callbackUrl }: { callbackUrl: string }) {
  return (
    <div className="min-h-screen bg-[#0b1628] flex items-center justify-center p-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center space-y-6">
        <div className="flex justify-center">
          <PssLogo showText={false} size={72} />
        </div>
        <div>
          <p className="text-sm text-blue-100">{ORG_NAME}</p>
          <h1 className="mt-2 text-3xl font-semibold">{APP_NAME}</h1>
          <p className="mt-2 text-sm text-blue-100/80">Sign in with your PSS Google account to continue.</p>
        </div>
        <button
          className="w-full rounded-lg bg-[#003366] px-4 py-3 font-medium hover:bg-[#004080]"
          onClick={() => signIn("google", { callbackUrl })}
        >
          Sign in with Google — PSS account
        </button>
      </div>
    </div>
  );
}
