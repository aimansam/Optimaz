"use client";

import { ReactNode } from "react";

export function DashboardWidget({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mb-6 sm:mb-8">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2 sm:mb-2">
        <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        {action}
      </div>
      <div>{children}</div>
    </section>
  );
}
