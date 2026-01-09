import { parseSnoozeDate } from "./date-parser";
import { handleModalInteraction } from "./modal-handler";
import { triggerPickDateMenu } from "./snooze-actions";

const INPUT_CLASS = "gmail-snooze-nl-input";
const ERROR_CLASS = "gmail-snooze-nl-error";

export function injectSnoozeInput(menu: HTMLElement) {
  // Prevent duplicate injection
  if (document.querySelector(`.${INPUT_CLASS}`)) {
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

  // Error message element
  const errorMsg = document.createElement("div");
  errorMsg.className = ERROR_CLASS;
  errorMsg.style.color = "#d93025";
  errorMsg.style.fontSize = "12px";
  errorMsg.style.display = "none";
  errorMsg.textContent = "Could not understand date/time";

  // Focus styles
  input.addEventListener("focus", (e) => {
    e.stopPropagation();
    input.style.border = "1px solid #1a73e8";
  });
  input.addEventListener("blur", () => {
    input.style.border = "1px solid #dadce0";
  });

  // Prevent click propagation
  input.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      removeInput();
      return;
    }

    // Always stop propagation for keys we handle or want to block Gmail from stealing
    e.stopPropagation();

    // Reset error on typing
    errorMsg.style.display = "none";
    input.style.border = "1px solid #1a73e8";

    if (e.key === "Enter") {
      const value = input.value.trim();
      if (!value) return;

      const result = parseSnoozeDate(value);

      if (result) {
        console.log("Parsed date:", result.date);
        // Trigger the menu item
        const triggered = triggerPickDateMenu(menu);
        if (!triggered) {
          console.error("Could not find 'Pick date & time' option");
          errorMsg.textContent = "Error: Option not found";
          errorMsg.style.display = "block";
        } else {
          // Hand off to the modal handler
          handleModalInteraction(result.date).catch((err) => {
            console.error("Modal interaction failed:", err);
            // Note: Menu and input are likely destroyed by Gmail at this point,
            // so we can't show feedback in the UI easily.
          });
        }
      } else {
        errorMsg.textContent = "Could not understand date/time";
        errorMsg.style.display = "block";
        input.style.border = "1px solid #d93025";
      }
    }
  });

  container.appendChild(input);
  container.appendChild(errorMsg);

  // Append to body to avoid interfering with menu
  document.body.appendChild(container);

  // Auto-focus the input
  setTimeout(() => input.focus(), 50);

  // Function to remove the input when menu is gone or action taken
  const removeInput = () => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  // Check if menu still exists periodically
  const checkMenu = () => {
    if (!document.contains(menu)) {
      removeInput();
      return;
    }
    setTimeout(checkMenu, 500);
  };
  setTimeout(checkMenu, 500);
}
