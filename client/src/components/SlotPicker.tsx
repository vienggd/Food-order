import { useEffect, useState } from "react";
import { api } from "../api";

type Slot = { start: string; state: "open" | "closed" | "full"; remaining: number };

const hhmm = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Bangkok" }).format(new Date(iso));

// F-09: pickup time. "" means ASAP. Closed and full slots are shown but cannot be chosen.
// ponytail: minimal picker (a select); a prettier slot grid can come with the Sprint 3 UI work.
export function SlotPicker({ value, onChange, reloadKey }: { value: string; onChange: (v: string) => void; reloadKey: number }) {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  useEffect(() => {
    api<Slot[]>("/api/slots").then(setSlots).catch(() => setSlots([]));
  }, [reloadKey]);

  return (
    <p className="muted">
      <label htmlFor="pickup-slot">Pickup time </label>
      <select id="pickup-slot" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">ASAP</option>
        {slots?.map((s) => (
          <option key={s.start} value={s.start} disabled={s.state !== "open"}>
            {hhmm(s.start)}
            {s.state === "closed" ? " (closed)" : s.state === "full" ? " (full)" : ""}
          </option>
        ))}
      </select>
    </p>
  );
}
