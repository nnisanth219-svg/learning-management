'use client';

import { Badge, Button, Card, PageLoader } from '@/components/ui';
import type { PlatformUser } from '@/data/types';
import { apiJson } from '@/lib/http/client';
import { Shield, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const ROLE_LABELS: Record<PlatformUser['role'], string> = {
  admin: 'Admin',
  student: 'Student',
};

const ROLE_VARIANTS: Record<PlatformUser['role'], 'primary' | 'secondary'> = {
  admin: 'primary',
  student: 'secondary',
};

function formatLoginTime(iso: string) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function TeamUsersPanel() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<{ users: PlatformUser[] }>('/api/users');
      setUsers(data.users);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  if (loading) return <PageLoader />;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card padding="md" className="lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-display font-bold">
            <Users className="h-5 w-5 text-primary" /> Platform Users
          </h3>
          <Button variant="outline" size="sm" onClick={() => void loadUsers()}>
            Refresh
          </Button>
        </div>
        <p className="mt-1 text-sm text-muted">
          Everyone who signs in — admins and students — is recorded here automatically on login.
        </p>

        {error ? (
          <p className="mt-4 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        ) : null}

        {!error && users.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-border/80 px-4 py-8 text-center text-sm text-muted">
            No users yet. Sign in as an admin or student to create the first record.
          </p>
        ) : null}

        {users.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted">
                  <th className="py-3 pr-4 font-semibold">Name</th>
                  <th className="py-3 pr-4 font-semibold">Email</th>
                  <th className="py-3 pr-4 font-semibold">Role</th>
                  <th className="py-3 pr-4 font-semibold">Student ID</th>
                  <th className="py-3 font-semibold">Last login</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border/40 last:border-0">
                    <td className="py-3 pr-4 font-medium">{user.displayName || '—'}</td>
                    <td className="py-3 pr-4 text-muted">{user.email}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={ROLE_VARIANTS[user.role]}>{ROLE_LABELS[user.role]}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted">{user.studentCode ?? '—'}</td>
                    <td className="py-3 text-muted">{formatLoginTime(user.lastLoginAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>

      <Card padding="md">
        <h3 className="flex items-center gap-2 font-display font-bold">
          <Shield className="h-5 w-5 text-primary" /> Roles
        </h3>
        <div className="mt-4 space-y-2">
          {[
            { role: 'Admin', desc: 'Full platform access and workspace owner' },
            { role: 'Student', desc: 'Learner portal access after enrollment' },
          ].map((item) => (
            <div
              key={item.role}
              className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3"
            >
              <div>
                <span className="text-sm font-medium">{item.role}</span>
                <p className="text-xs text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
