"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

export function NotificationBell({ notifications = [] }: { notifications?: { id: string, message: string, read?: boolean }[] }) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  return (
    <div className="relative inline-block">
      <button
        className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5 font-bold">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 shadow-lg rounded-xl z-50 border border-slate-200 dark:border-slate-700">
          <div className="p-3 font-semibold border-b border-slate-100 dark:border-slate-800">Notifications</div>
          <ul className="max-h-64 overflow-y-auto">
            {notifications.length === 0 && <li className="p-3 text-slate-400">No notifications</li>}
            {notifications.map(n => (
              <li key={n.id} className={"p-3 border-b border-slate-100 dark:border-slate-800 " + (n.read ? "text-slate-400" : "text-slate-800 dark:text-slate-100 font-bold")}>{n.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
