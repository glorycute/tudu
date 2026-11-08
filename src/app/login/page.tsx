import type { Metadata } from "next";
import { LoginButton } from "./LoginButton";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-title">tudu</h1>
        <p className="mt-2 text-body text-text-secondary">A calm place for today&apos;s tasks.</p>
        <div className="mt-8">
          <LoginButton />
        </div>
        {error && (
          <p role="alert" className="mt-4 text-secondary text-error">
            We couldn&apos;t sign you in. Please try again.
          </p>
        )}
      </div>
    </main>
  );
}
