"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { withBasePath } from "@/lib/base-path";

type EmailSettings = {
  smtpServer: string;
  smtpPort: number | null;
  smtpSecurity: string;
  smtpUsername: string;
  smtpFromEmail: string;
  smtpPasswordSet: boolean;
};

const EMPTY: EmailSettings = {
  smtpServer: "",
  smtpPort: null,
  smtpSecurity: "TLS",
  smtpUsername: "",
  smtpFromEmail: "",
  smtpPasswordSet: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<EmailSettings>(EMPTY);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch(withBasePath("/api/admin/settings/email"))
      .then((res) => res.json())
      .then((data: EmailSettings) => setSettings({ ...EMPTY, ...data }));
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch(withBasePath("/api/admin/settings/email"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...settings, smtpPassword: password }),
    });
    const data = (await res.json()) as { message?: string };
    setMessage(res.ok ? "SMTP settings saved" : data.message || "Save failed");
    if (res.ok) {
      setPassword("");
      setSettings((current) => ({ ...current, smtpPasswordSet: true }));
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>SMTP</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtpServer">Server</Label>
              <Input
                id="smtpServer"
                value={settings.smtpServer}
                onChange={(event) => setSettings({ ...settings, smtpServer: event.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">Port</Label>
              <Input
                id="smtpPort"
                type="number"
                value={settings.smtpPort ?? ""}
                onChange={(event) => setSettings({ ...settings, smtpPort: Number(event.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpSecurity">Security</Label>
              <Input
                id="smtpSecurity"
                value={settings.smtpSecurity}
                onChange={(event) => setSettings({ ...settings, smtpSecurity: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpUsername">Username</Label>
              <Input
                id="smtpUsername"
                value={settings.smtpUsername}
                onChange={(event) => setSettings({ ...settings, smtpUsername: event.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPassword">Password</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={settings.smtpPasswordSet ? "Saved — leave blank to keep" : ""}
                required={!settings.smtpPasswordSet}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpFromEmail">From</Label>
              <Input
                id="smtpFromEmail"
                type="email"
                value={settings.smtpFromEmail}
                onChange={(event) => setSettings({ ...settings, smtpFromEmail: event.target.value })}
                required
              />
            </div>
            {message && <p className="text-sm">{message}</p>}
            <Button type="submit" className="bg-[#003366] hover:bg-[#004080]" disabled={loading}>
              {loading ? "Saving…" : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
