'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuthStore } from '@/store/useAuthStore';
import { clsx } from 'clsx';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Removed redundant checkAuth call, handled by AuthInitializer
  useEffect(() => {
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Auto-close mobile sidebar when navigating to a new page
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Lock body scroll while mobile sidebar is open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#071739] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Verifying Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const role = user?.role?.toLowerCase();
  const showSidebar = role === 'instructor';

  return (
    <div className="bg-slate-50 min-h-screen">
      {showSidebar && (
        <>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          {/* Mobile backdrop — sits above the topbar (z-100) but below the sidebar (z-110) */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[105] lg:hidden"
              aria-hidden="true"
            />
          )}
        </>
      )}

      {/* Main Content Area */}
      <div className={clsx(
        "flex flex-col min-h-screen transition-all duration-300",
        showSidebar && "lg:pl-64"
      )}>
        <Topbar
          onToggleSidebar={showSidebar ? () => setSidebarOpen(v => !v) : undefined}
          sidebarOpen={sidebarOpen}
        />
        <main className="p-4 lg:p-8 pb-16 flex-1 max-w-screen-2xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
