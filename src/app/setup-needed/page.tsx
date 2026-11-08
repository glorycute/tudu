import type { Metadata } from "next";

export const metadata: Metadata = { title: "Setup needed" };

export default function SetupNeededPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
      <h1 className="text-heading">This app isn&apos;t connected to Supabase yet</h1>
      <p className="mt-3 text-body text-text-secondary">
        Add these two environment variables in Vercel under Settings, then Environment Variables. Then redeploy.
      </p>
      <ul className="mt-4 space-y-2 text-body">
        <li>
          <code className="rounded-sm bg-surface px-1.5 py-0.5 text-secondary">NEXT_PUBLIC_SUPABASE_URL</code>
          <span className="text-text-secondary"> like https://abcd1234.supabase.co</span>
        </li>
        <li>
          <code className="rounded-sm bg-surface px-1.5 py-0.5 text-secondary">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
        </li>
      </ul>
    </main>
  );
}
