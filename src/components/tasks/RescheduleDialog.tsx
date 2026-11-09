"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { addDays, isValidISODate, shortDateLabel, type ISODate } from "@/lib/dates";

/** Pick a new date for a task. Uses the native date input for good mobile and screen reader support. */
export function RescheduleDialog({
  open,
  current,
  today,
  onClose,
  onSave,
}: {
  open: boolean;
  current: ISODate | null;
  today: ISODate;
  onClose: () => void;
  onSave: (date: ISODate | null) => void;
}) {
  const [value, setValue] = useState(current ?? today);

  useEffect(() => {
    if (open) setValue(current && current >= today ? current : today);
  }, [open, current, today]);

  const valid = isValidISODate(value) && value >= today;
  const quick: Array<[string, ISODate]> = [
    ["Today", today],
    ["Tomorrow", addDays(today, 1)],
    ["Next week", addDays(today, 7)],
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={current === null ? "Schedule task" : "Reschedule task"}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!valid} onClick={() => valid && onSave(value)}>
            Move to {valid ? shortDateLabel(value, today) : "date"}
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap gap-2">
        {quick.map(([label, date]) => (
          <Button key={label} size="sm" variant={value === date ? "primary" : "secondary"} onClick={() => setValue(date)}>
            {label}
          </Button>
        ))}
        {current !== null && (
          <Button size="sm" onClick={() => onSave(null)}>
            Move to Inbox
          </Button>
        )}
      </div>
      <label className="mt-4 block text-label text-text-secondary" htmlFor="reschedule-date">
        Date
      </label>
      <input
        id="reschedule-date"
        type="date"
        min={today}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-1 h-10 w-full rounded-md border border-border-strong bg-bg px-3 text-body focus:border-primary focus:outline-none"
      />
    </Dialog>
  );
}
