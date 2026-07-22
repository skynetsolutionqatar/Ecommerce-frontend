"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import {
  formatClockDate,
  formatClockOffset,
  formatClockTime,
  getBrowserTimezone,
  getFixedClockTimezone,
  resolveTimezoneLabel,
} from "@/lib/admin/timezone";

export default function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  const [timeZone, setTimeZone] = useState(getFixedClockTimezone() ?? "UTC");
  const [locationLabel, setLocationLabel] = useState("");

  useEffect(() => {
    const tz = getFixedClockTimezone() ?? getBrowserTimezone();
    setTimeZone(tz);
    setLocationLabel(resolveTimezoneLabel(tz));
  }, []);

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
