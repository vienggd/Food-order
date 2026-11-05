import { describe, it, expect } from "vitest";
import { formatBaht } from "./money";

describe("formatBaht", () => {
  it("TEST-F02-07 formats integer satang as ฿xx.xx", () => {
    expect(formatBaht(6500)).toBe("฿65.00");
    expect(formatBaht(15500)).toBe("฿155.00");
    expect(formatBaht(0)).toBe("฿0.00");
    expect(formatBaht(5)).toBe("฿0.05");
  });
});
