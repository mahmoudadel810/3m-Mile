'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NAV_GROUPS, findResource } from '@/lib/admin/resources';
import { clearSession, getUser, type AdminUser } from '@/lib/admin/auth';
import { confirmDiscardChanges } from '@/lib/admin/unsavedGuard';

/**
 * Dashboard chrome: sidebar, header, sign-out.
 *
 * The login page renders bare — it has no session yet, so a sidebar full of links that
 * would all bounce back to login would be noise.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Read localStorage after mount so server and client first renders match.
  const [user, setUser] = useState<AdminUser | null>(null);
  useEffect(() => {
    setUser(getUser());
  }, []);

  if (pathname.startsWith('/admin/login')) {
    return <main className="min-h-screen bg-ink">{children}</main>;
  }

  const signOut = () => {
    if (!confirmDiscardChanges()) return;
    clearSession();
    router.replace('/admin/login');
  };

  return (
    <div className="min-h-screen bg-ink text-fg">
      <header className="flex items-center justify-between border-b border-line px-5 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            onClick={(e) => {
              if (!confirmDiscardChanges()) e.preventDefault();
            }}
            className="text-lg font-bold text-primary"
          >
            لوحة التحكم
          </Link>
          {/* An explicit way back to the live site — the admin needs to check their work. */}
          <Link href="/" target="_blank" className="text-sm text-fg-muted underline">
            عرض الموقع ↗
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {user && <span className="text-fg-muted">{user.fullName || user.email}</span>}
          <button onClick={signOut} className="rounded-[var(--radius-sm)] border border-line px-3 py-1">
            تسجيل الخروج
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-5 lg:flex-row">
        <nav
          aria-label="أقسام لوحة التحكم"
          className="border-b border-primary/40 pb-4 lg:sticky lg:top-5 lg:h-fit lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-e lg:pb-0 lg:pe-4"
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-fg-dim" style={{ color: 'red' }}>{group.title}</p>
              <ul className="space-y-1">
                {group.keys.map((key) => {
                  const resource = findResource(key);
                  if (!resource) return null;
                  const href = `/admin/${key}`;
                  const active = pathname === href;
                  return (
                    <li key={key}>
                      <Link
                        href={href}
                        onClick={(e) => {
                          if (!confirmDiscardChanges()) e.preventDefault();
                        }}
                        aria-current={active ? 'page' : undefined}
                        className={`block rounded-[var(--radius-sm)] px-3 py-1.5 text-sm ${
                          active ? 'bg-primary font-bold text-white' : 'text-fg-muted hover:bg-glass'
                        }`}
                      >
                        {resource.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
