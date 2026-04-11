"use client";

import { ReactNode } from "react";

export function DashboardWidget({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      <div>{children}</div>
    </section>
  );
}
