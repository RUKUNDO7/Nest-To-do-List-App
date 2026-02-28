'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signup } from '@/lib/api';
import { getStoredToken, setAuthSession } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
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
      const response = await signup({ name, email, password });
      setAuthSession(response.accessToken, response.user);
      router.replace('/dashboard');
    } catch (err) {
      console.error('Signup failed', err);
      setError('Signup failed. Please verify your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-lg mx-auto space-y-6">
        <header className="app-shell rounded-[24px] p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Get started</p>
          <h1 className="text-3xl font-semibold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Build a personalized dashboard with secure access to your tasks.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="app-shell rounded-[24px] p-6 space-y-4 shadow-sm">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <label className="block text-sm text-muted-foreground">
            Full name
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </label>
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
            Password (min 8 chars)
            <input
              type="password"
              minLength={8}
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link className="text-foreground underline" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
