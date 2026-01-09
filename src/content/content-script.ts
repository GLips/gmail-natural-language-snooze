import { observeSnoozeMenu } from "./dom-observer";
import { injectSnoozeInput } from "./ui-injector";

console.log("Gmail Snooze NL Extension loaded");

observeSnoozeMenu((menu) => {
  console.log("Snooze menu detected!", menu);
  injectSnoozeInput(menu);
});
