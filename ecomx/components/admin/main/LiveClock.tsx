"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Clock3 } from "lucide-react";
import {
  formatClockDate,
  formatClockOffset,
  formatClockTime,
  getFixedClockTimezone,
  resolveClockTimezone,
  resolveTimezoneLabel,
} from "@/lib/admin/timezone";

function subscribeNoop() {
  return () => {};
}

function getServerTimeZone() {
  return getFixedClockTimezone() ?? "UTC";
}

export default function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  const timeZone = useSyncExternalStore(
    subscribeNoop,
    resolveClockTimezone,
    getServerTimeZone
  );

  const locationLabel = useSyncExternalStore(
    subscribeNoop,
    () => resolveTimezoneLabel(resolveClockTimezone()),
    () => resolveTimezoneLabel(getServerTimeZone())
  );

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const time = formatClockTime(now, timeZone);
  const date = formatClockDate(now, timeZone);
  const offset = formatClockOffset(now, timeZone);

  return (
    <div className="admin-nav-clock" aria-live="polite" title={`${locationLabel} — ${timeZone}`}>
      <Clock3 size={16} className="admin-nav-clock-icon" aria-hidden />
      <div className="admin-nav-clock-text">
        <span className="admin-nav-clock-time">{time}</span>
        <span className="admin-nav-clock-date">
          {date}
          {locationLabel && (
            <span className="admin-nav-clock-location">
              {locationLabel}
              {offset ? ` · ${offset}` : ""}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
