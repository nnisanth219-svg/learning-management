import { MobileNav } from '@/components/app/mobile-nav';
import { Sidebar } from '@/components/app/sidebar';
import { TopBar } from '@/components/app/top-bar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />
        <div className="lg:pl-[240px]">
        <MobileNav />
        <TopBar />
        <main className="px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
