import { format } from "date-fns";
import { parseSnoozeDate } from "./date-parser";
import { handleModalInteraction } from "./modal-handler";
import { ensureSnoozeMenu, triggerPickDateMenu } from "./snooze-actions";
import { showSnoozeToast } from "./toast";

const INPUT_CLASS = "gmail-snooze-nl-input";
const ERROR_CLASS = "gmail-snooze-nl-error";

let automationInProgress = false;

export function injectSnoozeInput(menu: HTMLElement) {
  // Prevent duplicate injection
  if (document.querySelector(`.${INPUT_CLASS}`)) {
    return;
  }

  if (automationInProgress) {
    return;
  }

  const container = document.createElement("div");
  container.className = "gmail-snooze-nl-container";
  container.style.padding = "8px 16px";
  container.style.border = "1px solid rgba(0,0,0,0.1)";
  container.style.borderRadius = "4px";
  container.style.backgroundColor = "white";
  container.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "4px";
  container.style.zIndex = "1000";
  container.style.position = "fixed";

  // Position near the menu
  const rect = menu.getBoundingClientRect();
  container.style.top = `${rect.top - 60}px`; // Above the menu
  container.style.left = `${rect.left}px`;
  container.style.width = `${rect.width}px`;

  const input = document.createElement("input");
  input.type = "text";
  input.className = INPUT_CLASS;
  input.placeholder = "Type a time... (e.g. 'next Tue 9am')";

  // Basic styling to match Gmail loosely
  input.style.width = "100%";
  input.style.padding = "8px";
  input.style.borderRadius = "4px";
  input.style.border = "1px solid #dadce0";
  input.style.fontSize = "14px";
  input.style.fontFamily = "Roboto, RobotoDraft, Helvetica, Arial, sans-serif";
  input.style.boxSizing = "border-box";
  input.style.outline = "none";

  // Date preview element (shows parsed date as you type)
  const preview = document.createElement("div");
  preview.className = "gmail-snooze-nl-preview";
  preview.style.padding = "8px 10px";
  preview.style.backgroundColor = "#f8f9fa";
  preview.style.borderRadius = "4px";
  preview.style.fontSize = "13px";
  preview.style.color = "#202124";
  preview.style.display = "none";
  preview.style.borderLeft = "3px solid #1a73e8";

  // Error message element
  const errorMsg = document.createElement("div");
  errorMsg.className = ERROR_CLASS;
  errorMsg.style.color = "#d93025";
  errorMsg.style.fontSize = "12px";
  errorMsg.style.display = "none";
  errorMsg.textContent = "Could not understand date/time";

  // Update preview as user types
  const updatePreview = () => {
    const value = input.value.trim();
    if (!value) {
      preview.style.display = "none";
      return;
    }

    const result = parseSnoozeDate(value);
    if (result) {
      const formattedDate = format(result.date, "EEEE, MMMM d, yyyy");
      const formattedTime = format(result.date, "h:mm a");
      preview.innerHTML = `<span style="color: #5f6368;">Snooze until:</span> <strong>${formattedDate}</strong> at <strong>${formattedTime}</strong>`;
      preview.style.display = "block";
      errorMsg.style.display = "none";
    } else {
      preview.style.display = "none";
    }
  };

  let removed = false;
  const removeInput = () => {
    if (removed) {
      return;
    }
    removed = true;

    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  const runAutomation = async (targetDate: Date) => {
    automationInProgress = true;
    removeInput();

    // Capture message URL before we start (in case navigation happens)
    const messageUrl = window.location.href;

    try {
      let attempts = 0;
      let triggered = false;

      while (!triggered && attempts < 3) {
        attempts += 1;
        console.log(`Gmail Snooze: attempt ${attempts}`);

        // Always try to get a fresh menu - the original is likely gone
        const candidateMenu = await ensureSnoozeMenu();

        if (!candidateMenu) {
          console.log("Gmail Snooze: no menu found, retrying...");
          await new Promise((resolve) => setTimeout(resolve, 300));
          continue;
        }

        console.log("Gmail Snooze: menu found, waiting for it to populate...");
        await new Promise((resolve) => setTimeout(resolve, 200));

        triggered = await triggerPickDateMenu(candidateMenu, 2000);
        console.log(`Gmail Snooze: triggerPickDateMenu returned ${triggered}`);

        if (!triggered) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      if (!triggered) {
        throw new Error("Could not trigger 'Pick date & time'");
      }

      console.log("Gmail Snooze: waiting for modal...");
      await handleModalInteraction(targetDate);
      console.log("Gmail Snooze: done!");

      // Show success toast
      showSnoozeToast(targetDate, messageUrl);
    } catch (automationError) {
      console.error("Gmail Snooze: automation failed", automationError);
      if (typeof window !== "undefined" && typeof window.alert === "function") {
        window.alert("Couldn't complete the Snooze action. Please try again.");
      }
    } finally {
      automationInProgress = false;
    }
  };

  // Focus styles
  input.addEventListener("focus", (e) => {
    e.stopPropagation();
    input.style.border = "1px solid #1a73e8";
  });
  input.addEventListener("blur", () => {
    input.style.border = "1px solid #dadce0";
    removeInput();
  });

  // Prevent click propagation
  input.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Update preview on input
  input.addEventListener("input", () => {
    updatePreview();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      removeInput();
      return;
    }

    // Always stop propagation for keys we handle or want to block Gmail from stealing
    e.stopPropagation();

    if (e.key === "Enter") {
      const value = input.value.trim();
      if (!value) return;

      const result = parseSnoozeDate(value);

      if (result) {
        console.log("Parsed date:", result.date);
        runAutomation(result.date);
      } else {
        errorMsg.textContent = "Could not understand date/time";
        errorMsg.style.display = "block";
        input.style.border = "1px solid #d93025";
      }
    } else {
      // Reset error on typing
      errorMsg.style.display = "none";
      input.style.border = "1px solid #1a73e8";
    }
  });

  container.appendChild(input);
  container.appendChild(preview);
  container.appendChild(errorMsg);

  // Append to body to avoid interfering with menu
  document.body.appendChild(container);

  // Auto-focus the input
  setTimeout(() => input.focus(), 50);
}
