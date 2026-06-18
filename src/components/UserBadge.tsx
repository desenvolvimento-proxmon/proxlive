"use client";

import { UserRound } from "lucide-react";
import type { AppUser } from "@/lib/types";

export function UserBadge({ user }: { user: AppUser | null }) {
  if (!user) return null;

  return (
    <div className="inline-flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
        <UserRound className="h-4 w-4" />
      </span>
      <span className="max-w-48 truncate">
        <strong className="font-semibold text-slate-950">{user.name}</strong>
        <span className="block truncate text-xs text-slate-500">{user.email}</span>
      </span>
    </div>
  );
}
