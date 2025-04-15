
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ChevronLeft, LogOut, Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout, role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  if (!user) {
    return <div>You need to be logged in to access this page.</div>;
  }

  const getNavItems = () => {
    switch (role) {
      case 'student':
        return [
          { label: 'Dashboard', href: '/student/dashboard' },
          { label: 'My Grades', href: '/student/grades' },
          { label: 'Resit Exams', href: '/student/resit-exams' },
          { label: 'Declare Resit', href: '/student/declare-resit' },
          { label: 'Exam Schedule', href: '/student/exam-schedule' },
        ];
      case 'instructor':
        return [
          { label: 'Dashboard', href: '/instructor/dashboard' },
          { label: 'Submit Grades', href: '/instructor/submit-grades' },
          { label: 'Resit Exam Details', href: '/instructor/resit-details' },
          { label: 'Resit Participants', href: '/instructor/resit-participants' },
        ];
      case 'secretary':
        return [
          { label: 'Dashboard', href: '/secretary/dashboard' },
          { label: 'Upload Schedule', href: '/secretary/upload-schedule' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed sm:relative z-30 flex flex-col transition-all duration-300 h-screen bg-sidebar border-r border-sidebar-border",
          sidebarOpen ? "w-64" : "w-16",
          "dashboard-sidebar"
        )}
      >
        {/* Top of sidebar - Logo + name */}
        <div className="flex flex-col p-4 gap-2">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="font-semibold text-lg text-sidebar-foreground">
                Exam Manager
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ml-auto"
            >
              <ChevronLeft
                className={cn(
                  "h-5 w-5 transition-all",
                  !sidebarOpen && "rotate-180"
                )}
              />
            </Button>
          </div>
          {sidebarOpen && (
            <div className="text-sm text-sidebar-foreground/70">
              {role?.charAt(0).toUpperCase() + role?.slice(1) || 'User'}
            </div>
          )}
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-auto">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "flex w-full justify-start",
                window.location.pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50"
              )}
              onClick={() => navigate(item.href)}
            >
              {sidebarOpen ? (
                <span>{item.label}</span>
              ) : (
                <span>{item.label.charAt(0)}</span>
              )}
            </Button>
          ))}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* User info + logout */}
        <div className="p-4">
          {sidebarOpen && (
            <div className="mb-2">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-sidebar-foreground/70">
                {user.email}
              </div>
            </div>
          )}
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start",
              !sidebarOpen && "px-2 py-1 h-auto"
            )}
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "relative flex flex-col flex-1 overflow-x-hidden min-h-screen",
          "dashboard-main"
        )}
      >
        {/* Mobile header */}
        <header className="sticky top-0 z-20 flex items-center p-4 border-b bg-background sm:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-4 font-semibold">Exam Manager</div>
        </header>

        {/* Main content */}
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
};
