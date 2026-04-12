"use client";

import { ReactNode } from "react";

export function DashboardWidget({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6 sm:mb-8">
      <h3 className="mb-1 sm:mb-2 text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      <div>{children}</div>
    </section>
  );
}
