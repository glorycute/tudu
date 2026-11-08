"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { todayIn, type ISODate } from "@/lib/dates";
import type { Category, Profile } from "@/lib/types";

type AppContextValue = {
  supabase: SupabaseClient;
  profile: Profile;
  setProfile: (p: Profile) => void;
  categories: Category[];
  setCategories: (c: Category[]) => void;
  /** Today's date in the user's timezone. Updates at midnight. */
  today: ISODate;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

export function AppProvider({
  initialProfile,
  initialCategories,
  children,
}: {
  initialProfile: Profile;
  initialCategories: Category[];
  children: ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState(initialProfile);
  const [categories, setCategories] = useState(initialCategories);
  const [today, setToday] = useState(() => todayIn(initialProfile.timezone));

  // Keep "today" correct across midnight and timezone changes.
  useEffect(() => {
    const tick = () => setToday(todayIn(profile.timezone));
    tick();
    const id = setInterval(tick, 30_000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [profile.timezone]);

  // First visit: adopt the device timezone if the profile still has the default.
  useEffect(() => {
    const deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const untouched = profile.timezone === "UTC" && profile.created_at === profile.updated_at;
    if (!untouched || !deviceTz || deviceTz === "UTC") return;
    supabase
      .from("profiles")
      .update({ timezone: deviceTz })
      .eq("id", profile.id)
      .select()
      .single()
      .then(({ data }) => data && setProfile(data as Profile));
  }, [profile, supabase]);

  return (
    <AppContext.Provider value={{ supabase, profile, setProfile, categories, setCategories, today }}>
      {children}
    </AppContext.Provider>
  );
}
