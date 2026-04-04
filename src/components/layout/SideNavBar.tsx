"use client";

import { useRouter, usePathname } from "next/navigation";
import { Brain, LayoutDashboard, Users, Route, BarChart3, FolderOpen, HelpCircle, LogOut, Rocket } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Classroom", icon: Users, href: "/dashboard/classroom" },
  { label: "Learning Path", icon: Route, href: "/dashboard/learning-path" },
  { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
  { label: "Resources", icon: FolderOpen, href: "/dashboard/resources" },
];

export function SideNavBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r border-white/[0.06] bg-[#0e0e0e] flex flex-col py-8 z-50">
      {/* Logo */}
      <div className="px-6 mb-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-headline text-lg font-bold text-violet-400 tracking-wider">
              Synapse
            </h1>
            <p className="text-[9px] uppercase tracking-widest text-white/40">
              Teacher Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-4 px-4 py-3 transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-violet-500/20 to-cyan-500/10 text-[#d0bcff] rounded-r-full border-l-4 border-[#d0bcff]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm uppercase tracking-wider font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto px-4 space-y-4">
        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-[#3c0091] font-bold shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
          <Rocket className="w-4 h-4" />
          Launch Live Class
        </button>

        <div className="pt-4 border-t border-white/[0.06] space-y-1">
          <button className="w-full flex items-center gap-4 px-4 py-2 text-white/40 hover:text-white/60 text-xs uppercase tracking-widest transition-all">
            <HelpCircle className="w-4 h-4" />
            Support
          </button>
          <button className="w-full flex items-center gap-4 px-4 py-2 text-red-400/60 hover:text-red-400 text-xs uppercase tracking-widest transition-all">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
