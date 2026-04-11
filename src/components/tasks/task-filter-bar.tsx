"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function TaskFilterBar({ onFilter }: { onFilter: (query: string, status: string) => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  return (
    <div className="flex gap-2 mb-4">
      <Input
        value={query}
        onChange={e => { setQuery(e.target.value); onFilter(e.target.value, status); }}
        placeholder="Search tasks..."
        className="w-48"
      />
      <Select value={status} onChange={e => { setStatus(e.target.value); onFilter(query, e.target.value); }}>
        <option value="">All Statuses</option>
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </Select>
    </div>
  );
}
