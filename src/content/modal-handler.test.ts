import { describe, expect, it } from "bun:test";
import { formatDateForGmail, formatTimeForGmail } from "./modal-handler";

describe("formatDateForGmail", () => {
  const targetDate = new Date(2026, 0, 10); // Jan 10, 2026

  it("should match US format MMM d, yyyy", () => {
    const original = "Jan 1, 2025";
    expect(formatDateForGmail(targetDate, original)).toBe("Jan 10, 2026");
  });

  it("should match EU format d MMM, yyyy", () => {
    const original = "1 Jan, 2025";
    expect(formatDateForGmail(targetDate, original)).toBe("10 Jan, 2026");
  });

  it("should match numeric US format MM/dd/yyyy", () => {
    const original = "01/01/2025";
    expect(formatDateForGmail(targetDate, original)).toBe("01/10/2026");
  });

  it("should default to MMM d, yyyy for empty original", () => {
    expect(formatDateForGmail(targetDate, "")).toBe("Jan 10, 2026");
  });

  // New cases that might fail currently
  it("should match dot format dd.MM.yyyy", () => {
    const original = "01.01.2025";
    expect(formatDateForGmail(targetDate, original)).toBe("10.01.2026");
  });

  it("should match dash format yyyy-MM-dd", () => {
    const original = "2025-01-01";
    expect(formatDateForGmail(targetDate, original)).toBe("2026-01-10");
  });
});

describe("formatTimeForGmail", () => {
  const targetDate = new Date(2026, 0, 10, 13, 30); // 13:30

  it("should match 12h format", () => {
    const original = "8:00 AM";
    expect(formatTimeForGmail(targetDate, original)).toBe("1:30 PM");
  });

  it("should match 24h format", () => {
    const original = "08:00";
    expect(formatTimeForGmail(targetDate, original)).toBe("13:30");
  });
});
