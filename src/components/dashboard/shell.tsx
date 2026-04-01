"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
}

const NAV_ITEMS: Record<string, { label: string; href: string; icon: React.ElementType }[]> = {
  TEACHER: [
    { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
    { label: "Subjects", href: "/teacher/subjects", icon: BookOpen },
    { label: "Students", href: "/teacher/students", icon: Users },
    { label: "Analytics", href: "/teacher/analytics", icon: BarChart3 },
  ],
  STUDENT: [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "Subjects", href: "/student/subjects", icon: BookOpen },
    { label: "Progress", href: "/student/progress", icon: BarChart3 },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Teachers", href: "/admin/teachers", icon: Users },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
};

function SidebarContent({
  user,
  collapsed,
  onToggle,
}: {
  user: UserInfo;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const items = NAV_ITEMS[user.role] ?? NAV_ITEMS.STUDENT;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col h-full py-4">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-lg font-semibold text-white whitespace-nowrap overflow-hidden"
            >
              Synapse
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="ml-auto text-white/30 hover:text-white/60 transition-colors hidden lg:block"
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform duration-200 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
                active
                  ? "bg-violet-500/15 text-violet-300"
                  : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-violet-400"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-white/[0.06] mx-4 my-3" />

      {/* User Footer */}
      <div className="px-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="bg-violet-500/20 text-violet-300 text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white/80 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-white/30 truncate">{user.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`w-full text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors ${
            collapsed ? "justify-center px-0" : "justify-start"
          }`}
          size="sm"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="ml-2">Sign out</span>}
        </Button>
      </div>
    </div>
  );
}

export function DashboardShell({
  user,
  children,
}: {
  user: UserInfo;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[hsl(220,20%,6%)]">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="hidden lg:flex flex-col border-r border-white/[0.06] bg-[hsl(220,15%,8%)] shrink-0"
      >
        <SidebarContent
          user={user}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </motion.aside>

      {/* Mobile Header + Sheet */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-white/[0.06] bg-[hsl(220,15%,8%)]">
          <Sheet>
            <SheetTrigger render={
              <Button variant="ghost" size="icon" className="text-white/50">
                <Menu className="w-5 h-5" />
              </Button>
            } />
            <SheetContent
              side="left"
              className="w-64 p-0 bg-[hsl(220,15%,8%)] border-white/[0.06]"
            >
              <SidebarContent
                user={user}
                collapsed={false}
                onToggle={() => {}}
              />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-400" />
            <span className="font-semibold text-white">Synapse</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
