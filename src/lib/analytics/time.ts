/** Dates in UK time, which is how the board groups days and hours. */

const TZ = "Europe/London";

/** "YYYY-MM-DD" in UK time. */
export function londonDate(d: Date | string | number) {
  return new Date(d).toLocaleDateString("en-CA", { timeZone: TZ });
}

/** Hour of day (0-23) in UK time. */
export function londonHour(d: Date | string | number) {
  return Number(new Date(d).toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: TZ })) % 24;
}

/** Minutes the UK is ahead of UTC at that instant (0 or 60). */
function offsetMinutes(at: number) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(at);
  const h = Number(parts.find((p) => p.type === "hour")?.value) % 24;
  const m = Number(parts.find((p) => p.type === "minute")?.value);
  const utc = new Date(at);
  let diff = h * 60 + m - (utc.getUTCHours() * 60 + utc.getUTCMinutes());
  if (diff < -720) diff += 1440;
  if (diff > 720) diff -= 1440;
  return diff;
}

/** The instant UK midnight starts on a "YYYY-MM-DD" day. */
export function londonMidnight(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  const guess = Date.UTC(y!, m! - 1, d!);
  return new Date(guess - offsetMinutes(guess) * 60_000);
}

/** "YYYY-MM-DD" plus n days. */
export function addDays(day: string, n: number) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d! + n)).toISOString().slice(0, 10);
}
