"use client";

import { ReactNode } from "react";

export function DashboardWidget({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mb-5">
      {/* Section header — Linear-inspired clean label */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="h-3.5 w-0.5 rounded-full"
            style={{
              background: 'linear-gradient(to bottom, rgb(var(--accent)), rgb(var(--accent) / 0.5))',
            }}
          />
          <h3 className="gradient-text text-sm font-semibold tracking-tight">
            {title}
          </h3>
        </div>
        {action && (
          <div className="shrink-0">{action}</div>
        )}
      </div>
      {/* Widget content */}
      <div className="space-y-2">{children}</div>
    </section>
  );
}
