"use client";

import { Search, Bell, Settings } from "lucide-react";

export function TopNavBar() {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 flex justify-between items-center px-8 bg-[#131313]/60 backdrop-blur-xl z-40 border-b border-white/[0.06]">
      {/* Search */}
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search modules..."
            className="w-full bg-white/[0.04] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-violet-500/50 placeholder:text-white/30 text-white"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all">
          <Settings className="w-5 h-5" />
        </button>
        <div className="h-8 w-8 rounded-full overflow-hidden border border-violet-500/30">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=teacher"
            alt="Teacher avatar"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
