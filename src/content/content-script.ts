import * as chrono from "chrono-node";

console.log("Gmail Snooze NL Extension loaded");

// specific test to ensure chrono is working
const testDate = chrono.parseDate("tomorrow");
console.log("Chrono test (tomorrow):", testDate);
