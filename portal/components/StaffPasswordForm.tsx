"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export function StaffPasswordForm({ afterLoginUrl }: { afterLoginUrl: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirect: false,
      callbackUrl: afterLoginUrl,
    });
    if (result?.error || !result?.ok) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }
    window.location.assign(afterLoginUrl);
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3 text-left">
      <label className="block text-sm text-blue-100/80" htmlFor="email">
        Email
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="mt-1 w-full rounded-lg border border-white/15 bg-[#0b1628] px-3 py-3 text-white outline-none focus:border-[#1a56c4]"
        />
      </label>
      <label className="block text-sm text-blue-100/80" htmlFor="password">
        Password
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 w-full rounded-lg border border-white/15 bg-[#0b1628] px-3 py-3 text-white outline-none focus:border-[#1a56c4]"
        />
      </label>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#1a56c4] px-4 py-3 font-medium text-white hover:bg-[#2563eb] disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
