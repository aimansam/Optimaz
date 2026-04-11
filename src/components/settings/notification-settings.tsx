"use client";

import { useState } from "react";
import { Toggle } from "@/components/ui/toggle";

export function NotificationSettings() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Notifications</h2>
      <div className="flex items-center gap-2">
        <Toggle pressed={emailEnabled} onClick={() => setEmailEnabled(v => !v)} />
        <span>Email reminders for upcoming deadlines</span>
      </div>
      <div className="flex items-center gap-2">
        <Toggle pressed={pushEnabled} onClick={() => setPushEnabled(v => !v)} />
        <span>Push notifications for due/overdue tasks</span>
      </div>
    </div>
  );
}
