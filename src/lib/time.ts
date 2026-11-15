/** "HH:MM" in 24-hour time, as used for tasks.start_time. */
export type TimeOfDay = string;

/**
 * Pulls a leading time off a task title.
 *   "8am gym"       -> { time: "08:00", title: "gym" }
 *   "5:30 pm swim"  -> { time: "17:30", title: "swim" }
 *   "17:30 dinner"  -> { time: "17:30", title: "dinner" }
 * Returns null when the title does not start with a time followed by a name.
 */
export function parseLeadingTime(input: string): { time: TimeOfDay; title: string } | null {
  const text = input.trim();
  const pad = (n: number) => String(n).padStart(2, "0");

  const ampm = /^(\d{1,2})(?::([0-5]\d))?\s*(am|pm)\.?\s+(\S.*)$/i.exec(text);
  if (ampm) {
    const hour = Number(ampm[1]);
    if (hour < 1 || hour > 12) return null;
    const isPm = ampm[3].toLowerCase() === "pm";
    const h24 = (hour % 12) + (isPm ? 12 : 0);
    return { time: `${pad(h24)}:${ampm[2] ?? "00"}`, title: ampm[4].trim() };
  }

  const h24 = /^([01]?\d|2[0-3]):([0-5]\d)\s+(\S.*)$/.exec(text);
  if (h24) return { time: `${pad(Number(h24[1]))}:${h24[2]}`, title: h24[3].trim() };

  return null;
}

/** "08:00" -> "8am", "17:30" -> "5:30pm". Accepts "HH:MM" or "HH:MM:SS". */
export function formatTimeOfDay(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour}:${String(m).padStart(2, "0")}${suffix}` : `${hour}${suffix}`;
}
