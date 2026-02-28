'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { login } from '@/lib/api';
import { getStoredToken, setAuthSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login({ email, password });
      setAuthSession(response.accessToken, response.user);
      router.replace('/dashboard');
    } catch (err) {
      console.error('Login failed', err);
      setError('Login failed. Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-lg mx-auto space-y-6">
        <header className="app-shell rounded-[24px] p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Welcome back</p>
          <h1 className="text-3xl font-semibold text-foreground">Sign in to your workspace</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Access your private dashboard and keep your tasks organized.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="app-shell rounded-[24px] p-6 space-y-4 shadow-sm">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <label className="block text-sm text-muted-foreground">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </label>
          <label className="block text-sm text-muted-foreground">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          New here?{' '}
          <Link className="text-foreground underline" href="/signup">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
