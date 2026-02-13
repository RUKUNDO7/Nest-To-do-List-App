"use client"; // ← important, makes this a Client Component

import { Sparkles, AlarmClock, Search, Plus } from "lucide-react";

export default function IconSection() {
  return (
    <div className="flex flex-col gap-6">
      {/* Example icon row */}
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
          <Sparkles size={20} />
        </div>

        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Featured
          </p>
          <p className="text-sm font-semibold">Sparkles Section</p>
        </div>
      </div>

      {/* Another example icon row */}
      <div className="flex items-center gap-3">
        <AlarmClock size={16} className="text-muted-foreground" />
        <span>Alarm Feature</span>
      </div>

      <div className="flex items-center gap-3">
        <Search size={18} className="text-muted-foreground" />
        <span>Search</span>
      </div>

      <div className="flex items-center gap-3">
        <Plus size={18} />
        <span>Add Item</span>
      </div>
    </div>
  );
}