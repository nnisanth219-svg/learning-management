'use client';

import { PageHeader } from '@/components/dashboard/page-header';
import { Badge, Button, Card, PageLoader } from '@/components/ui';
import { APP_BRAND } from '@/lib/branding';
import { NOTIFICATIONS } from '@/data/mock';
import type { Notification } from '@/data/types';
import { AlertTriangle, Award, Bell, BookOpen, CheckCheck, Lock, Mail, UserPlus } from 'lucide-react';
import { TeamUsersPanel } from '@/components/dashboard/team-users-panel';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'team', label: 'Team & Roles' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'security', label: 'Security' },
] as const;

const typeConfig: Record<Notification['type'], { icon: typeof Bell; variant: 'primary' | 'success' | 'warning' | 'secondary' | 'muted' }> = {
  enrollment: { icon: UserPlus, variant: 'primary' },
  alert: { icon: AlertTriangle, variant: 'warning' },
  course: { icon: BookOpen, variant: 'secondary' },
  certificate: { icon: Award, variant: 'success' },
  system: { icon: Bell, variant: 'muted' },
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SettingsPageContent />
    </Suspense>
  );
}

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab = TABS.some((t) => t.id === tabParam) ? tabParam! : 'general';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  useEffect(() => {
    if (tabParam && TABS.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <>
      <PageHeader title="Settings" subtitle="Platform configuration, team access, and alerts." />

      <div className="mb-6 flex flex-wrap gap-2 border-b border-border/60 pb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted hover:bg-subtle'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <Card padding="md">
          <h3 className="font-display font-bold">General Settings</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Platform Name</label>
              <input className="enterprise-input mt-1.5" defaultValue={APP_BRAND.name} />
            </div>
            <div>
              <label className="text-sm font-medium">Support Email</label>
              <input className="enterprise-input mt-1.5" defaultValue="support@eduvantage.com" />
            </div>
            <div>
              <label className="text-sm font-medium">From Email</label>
              <input className="enterprise-input mt-1.5" defaultValue="noreply@eduvantage.com" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Primary Brand Color</label>
              <div className="mt-1.5 flex items-center gap-3">
                <input type="color" defaultValue="#1E40AF" className="h-10 w-14 cursor-pointer rounded-lg border border-border" />
                <span className="text-sm text-muted">Deep Blue (#1E40AF)</span>
              </div>
            </div>
          </div>
          <Button className="mt-6">Save Changes</Button>
        </Card>
      )}

      {activeTab === 'team' && (
        <TeamUsersPanel />
      )}

      {activeTab === 'notifications' && (
        <div>
          <div className="mb-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4" /> Mark All Read
            </Button>
          </div>
          <div className="space-y-3">
            {notifications.map((notification) => {
              const config = typeConfig[notification.type];
              const Icon = config.icon;
              return (
                <Card
                  key={notification.id}
                  padding="md"
                  className={notification.read ? 'opacity-70' : 'border-primary/20 bg-primary-soft/20'}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {!notification.read ? <Badge variant="primary">New</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-muted">{notification.message}</p>
                      <p className="mt-2 text-xs text-muted">{notification.createdAt}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <Card padding="md">
          <h3 className="flex items-center gap-2 font-display font-bold">
            <Lock className="h-5 w-5 text-primary" /> Security
          </h3>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-muted">Require 2FA for admin accounts</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
              <div>
                <p className="font-medium">Session Timeout</p>
                <p className="text-xs text-muted">Auto-logout after inactivity</p>
              </div>
              <select className="enterprise-input !w-auto">
                <option>30 minutes</option>
                <option>1 hour</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted" />
              <input type="checkbox" defaultChecked className="rounded" />
              <label className="text-sm">Send login alerts to admin email</label>
            </div>
          </div>
          <Button className="mt-6">Save Security Settings</Button>
        </Card>
      )}
    </>
  );
}
