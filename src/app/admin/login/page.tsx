'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiUrl } from '@/lib/api/client';
import { setSession } from '@/lib/admin/auth';

/**
 * Admin sign-in.
 *
 * There is no registration flow anywhere in this dashboard, deliberately: the backend
 * has no public sign-up, and admin accounts are created by an existing admin or by the
 * seed script. That removes an entire class of account-takeover and spam-signup risk.
 */
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get('from');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok || !body?.data?.accessToken) {
        // Deliberately not distinguishing "no such account" from "wrong password" —
        // that difference is an account-enumeration oracle.
        setError(body?.message === 'invalid_credentials' || !res.ok
          ? 'بيانات الدخول غير صحيحة.'
          : 'تعذّر تسجيل الدخول.');
        setBusy(false);
        return;
      }

      setSession(body.data.accessToken, body.data.user, body.data.refreshToken);
      // `replace`, not `push`: the login page must not sit in history behind the
      // dashboard, or Back would land on it while signed in.
      router.replace(from && from.startsWith('/admin') ? from : '/admin');
    } catch {
      setError('تعذّر الاتصال بالخادم. تأكد من تشغيل الـ API.');
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-[var(--radius-md)] border border-line p-6">
        <h1 className="mb-6 text-center text-2xl font-bold text-primary">لوحة تحكم 3M مايل</h1>

        <label htmlFor="email" className="mb-1 block text-sm font-bold text-fg">البريد الإلكتروني</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          dir="ltr"
          className="mb-4 w-full rounded-[var(--radius-sm)] border border-line bg-ink px-3 py-2 text-fg outline-none focus:border-primary"
        />

        <label htmlFor="password" className="mb-1 block text-sm font-bold text-fg">كلمة المرور</label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          dir="ltr"
          className="mb-5 w-full rounded-[var(--radius-sm)] border border-line bg-ink px-3 py-2 text-fg outline-none focus:border-primary"
        />

        {error && (
          <p role="alert" className="mb-4 rounded-[var(--radius-sm)] bg-primary/15 p-3 text-sm text-primary">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-[var(--radius-sm)] bg-primary py-2 font-bold text-white disabled:opacity-50"
        >
          {busy ? 'جارٍ الدخول…' : 'دخول'}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-fg-muted">…</div>}>
      <LoginForm />
    </Suspense>
  );
}
