import { describe, it, expect } from "vitest";
import { bahtToSatang } from "./price";

describe("bahtToSatang", () => {
  it("converts baht text to satang", () => {
    expect(bahtToSatang("55")).toEqual({ satang: 5500 });
    expect(bahtToSatang("55.5")).toEqual({ satang: 5550 });
    expect(bahtToSatang("0.01")).toEqual({ satang: 1 });
    expect(bahtToSatang("1000.00")).toEqual({ satang: 100000 });
  });
  it("rejects bad prices", () => {
    for (const t of ["", "0", "1000.01", "abc", "-5", "5.555"]) expect("error" in bahtToSatang(t)).toBe(true);
  });
});
