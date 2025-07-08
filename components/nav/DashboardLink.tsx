"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export function DashboardLink() {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <Link
      href="/dashboard"
      className="glass-morphism border border-feedbackme-yellow/20 hover:border-feedbackme-yellow/40 text-white px-3 py-1.5 text-sm flex items-center space-x-2 transition-all duration-300 hover:scale-105"
    >
      <LayoutDashboard className="w-4 h-4" />
      <span>Dashboard</span>
    </Link>
  );
} 