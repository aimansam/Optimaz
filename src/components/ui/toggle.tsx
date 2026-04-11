import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean;
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, pressed, ...props }, ref) => (
    <button
      type="button"
      ref={ref}
      data-state={pressed ? "on" : "off"}
      aria-pressed={pressed}
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium ring-offset-white transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        pressed && "bg-slate-200 dark:bg-slate-800",
        className
      )}
      {...props}
    />
  )
);
Toggle.displayName = "Toggle";
