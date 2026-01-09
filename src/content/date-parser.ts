import * as chrono from "chrono-node";

export interface ParseResult {
  date: Date;
  text: string;
}

export function parseSnoozeDate(input: string): ParseResult | null {
  const results = chrono.parse(input, new Date(), { forwardDate: true });

  if (results.length === 0 || !results[0]) {
    return null;
  }

  // Use the first result
  const result = results[0];
  const date = result.start.date();

  // Validate that the date is in the future
  if (date < new Date()) {
    // If it's in the past but close (e.g. "9am" when it's 10am), chrono might default to today.
    // forwardDate: true usually handles this by pushing to tomorrow, but let's be safe.
    // If it's truly in the past, we might want to reject it or let the UI show an error.
    // For now, let's just return it and let the validation logic decide,
    // but the PRD says "NL parses to a past date -> show error".
    return null;
  }

  return {
    date: date,
    text: result.text,
  };
}
