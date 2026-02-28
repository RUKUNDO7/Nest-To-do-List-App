'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { getStoredToken, getStoredUser, type AuthUser } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    const storedUser = getStoredUser();

    if (token && storedUser) {
      router.replace('/dashboard');
      return;
    }

    setUser(storedUser);
    setReady(true);
  }, [router]);

  if (!ready) {
    return <div className="min-h-screen" />;
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="app-shell rounded-[28px] p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Nest To Do List App
              </p>
              <h1 className="text-4xl font-semibold text-foreground">
                A focused workspace with authentication, secure data, and personal dashboards.
              </h1>
              <p className="text-base text-muted-foreground max-w-xl">
                Sign up to get your own private task list, track progress, and keep your work safely scoped to your account.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                Create account
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl border border-input bg-card px-5 py-3 text-sm font-medium text-foreground shadow-sm hover:border-primary/40"
              >
                Sign in
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-2xl border border-input bg-card px-5 py-3 text-sm font-medium text-foreground shadow-sm hover:border-primary/40"
                >
                  Dashboard
                  <LayoutDashboard size={16} />
                </Link>
              )}
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="app-shell rounded-[26px] p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Secure access</p>
                <p className="text-sm text-muted-foreground">
                  JWT-backed authentication and role-based access control keep data scoped.
                </p>
              </div>
            </div>
          </div>
          <div className="app-shell rounded-[26px] p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
                <LayoutDashboard size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Personal dashboard</p>
                <p className="text-sm text-muted-foreground">
                  A private workspace with progress tracking and focus cues.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
