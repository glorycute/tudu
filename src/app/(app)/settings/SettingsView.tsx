"use client";

import { useMemo, useState, type ReactNode } from "react";
import { LogOut } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useApp } from "@/lib/app-context";
import type { Profile } from "@/lib/types";

function Row({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between">
      <label htmlFor={htmlFor} className="text-body font-medium">
        {label}
      </label>
      <div className="sm:w-72">{children}</div>
    </div>
  );
}

const selectClass =
  "h-10 w-full rounded-md border border-border-strong bg-bg px-3 text-body hover:border-text-disabled focus:border-primary focus:outline-none";

export function SettingsView() {
  const { supabase, profile, setProfile } = useApp();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const timezones = useMemo(() => {
    const list = Intl.supportedValuesOf("timeZone");
    return list.includes("UTC") ? list : ["UTC", ...list];
  }, []);

  const save = async (patch: Partial<Pick<Profile, "timezone" | "week_starts_on">>) => {
    setSaving(true);
    const previous = profile;
    setProfile({ ...profile, ...patch });
    const { data, error } = await supabase.from("profiles").update(patch).eq("id", profile.id).select().single();
    setSaving(false);
    if (error) {
      setProfile(previous);
      toast({ message: "Couldn't save your settings. Try again.", tone: "error" });
      return;
    }
    setProfile(data as Profile);
    toast({ message: "Settings saved" });
  };

  return (
    <>
      <PageHeader title="Settings" />

      <section aria-labelledby="account-heading" className="mb-10">
        <h2 id="account-heading" className="mb-2 text-subheading">Account</h2>
        <div className="flex items-center gap-3 border-b border-border py-4">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="size-10 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <span aria-hidden className="flex size-10 items-center justify-center rounded-full bg-hover text-subheading">
              {(profile.full_name ?? profile.email ?? "?").charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-body font-medium">{profile.full_name ?? "Your account"}</p>
            <p className="truncate text-secondary text-text-secondary">{profile.email}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="prefs-heading" className="mb-10">
        <h2 id="prefs-heading" className="mb-2 text-subheading">Preferences</h2>
        <Row label="Timezone" htmlFor="timezone">
          <select
            id="timezone"
            className={selectClass}
            value={profile.timezone}
            disabled={saving}
            onChange={(e) => save({ timezone: e.target.value })}
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </Row>
        <Row label="Week starts on" htmlFor="week-start">
          <select
            id="week-start"
            className={selectClass}
            value={profile.week_starts_on}
            disabled={saving}
            onChange={(e) => save({ week_starts_on: Number(e.target.value) as 0 | 1 })}
          >
            <option value={1}>Monday</option>
            <option value={0}>Sunday</option>
          </select>
        </Row>
        <p className="mt-3 text-secondary text-text-secondary">
          Tasks become read-only 48 hours after their day ends, at midnight in your timezone.
        </p>
      </section>

      <form action="/auth/signout" method="post">
        <Button type="submit">
          <LogOut className="size-4" aria-hidden />
          Sign out
        </Button>
      </form>
    </>
  );
}
