import type { Metadata } from "next";

export const metadata: Metadata = { title: "Setup needed" };

/** Describe what was found for each setting, without ever showing its value. */
function urlStatus(value: string | undefined) {
  if (!value) return "Missing";
  if (value !== value.trim()) return "Has spaces before or after it";
  if (/^["']|["']$/.test(value)) return "Has quotes around it. Remove them";
  try {
    const u = new URL(value);
    if (u.protocol !== "https:") return "Must start with https://";
    if (u.pathname !== "/" && u.pathname !== "") return "Has extra text after .supabase.co. Remove it";
    return "OK";
  } catch {
    return "Not a valid URL. It should look like https://abcd1234.supabase.co";
  }
}

function keyStatus(value: string | undefined) {
  if (!value) return "Missing";
  if (value !== value.trim()) return "Has spaces before or after it";
  return "OK";
}

export default function SetupNeededPage() {
  const rows: Array<[string, string]> = [
    ["NEXT_PUBLIC_SUPABASE_URL", urlStatus(process.env.NEXT_PUBLIC_SUPABASE_URL)],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", keyStatus(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)],
  ];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
      <h1 className="text-heading">This app isn&apos;t connected to Supabase yet</h1>
      <p className="mt-3 text-body text-text-secondary">
        This is what this build found for each setting:
      </p>
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {rows.map(([name, status]) => (
          <li key={name} className="py-3">
            <code className="text-secondary font-medium">{name}</code>
            <p className={`mt-1 text-secondary ${status === "OK" ? "text-success" : "text-error"}`}>{status}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-secondary text-text-secondary">
        Fix them in Vercel under Settings, then Environment Variables. Make sure Preview is ticked as well as
        Production. Then redeploy this deployment.
      </p>
    </main>
  );
}
