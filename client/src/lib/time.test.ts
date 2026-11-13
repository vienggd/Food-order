import { describe, it, expect } from "vitest";
import { formatPlacedTime } from "./time";

describe("formatPlacedTime", () => {
  const now = new Date(2026, 10, 7, 14, 0); // 7 Nov 2026 14:00 local
  it("today -> HH:MM, yesterday -> Yesterday HH:MM, older -> D Mon HH:MM (ui-spec conventions)", () => {
    expect(formatPlacedTime(new Date(2026, 10, 7, 10, 15).toISOString(), now)).toBe("10:15");
    expect(formatPlacedTime(new Date(2026, 10, 6, 12, 2).toISOString(), now)).toBe("Yesterday 12:02");
    expect(formatPlacedTime(new Date(2026, 10, 3, 9, 40).toISOString(), now)).toBe("3 Nov 09:40");
  });
});
