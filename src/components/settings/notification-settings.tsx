"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

export function NotificationSettings() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Notifications</h2>
      <div className="flex items-center gap-2">
        <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
        <span>Email reminders for upcoming deadlines</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
        <span>Push notifications for due/overdue tasks</span>
      </div>
    </div>
  );
}
