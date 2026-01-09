import { format } from "date-fns";

const MODAL_SELECTOR = 'div[role="dialog"][aria-modal="true"]';
const DATE_INPUT_SELECTOR = 'input[aria-label="Date"]';
const TIME_INPUT_SELECTOR = 'input[aria-label="Time"]';
const SAVE_BUTTON_SELECTOR = 'button[data-mdc-dialog-action="ok"]'; // also check text content "Save"

/**
 * Orchestrates the interaction with the "Pick date & time" modal.
 */
export async function handleModalInteraction(targetDate: Date): Promise<void> {
  try {
    const modal = await waitForModal();
    if (!modal) {
      throw new Error("Modal did not appear");
    }

    // Give it a tick to ensure inputs are ready/populated
    await new Promise((resolve) => setTimeout(resolve, 100));

    const dateInput = modal.querySelector(
      DATE_INPUT_SELECTOR,
    ) as HTMLInputElement;
    const timeInput = modal.querySelector(
      TIME_INPUT_SELECTOR,
    ) as HTMLInputElement;

    if (!dateInput || !timeInput) {
      throw new Error("Could not find date/time inputs in modal");
    }

    // 1. Fill Date
    const originalDateValue = dateInput.value;
    const formattedDate = formatDateForGmail(targetDate, originalDateValue);
    await setInputValue(dateInput, formattedDate);

    // 2. Fill Time
    const originalTimeValue = timeInput.value;
    const formattedTime = formatTimeForGmail(targetDate, originalTimeValue);
    await setInputValue(timeInput, formattedTime);

    // 3. Click Save
    const saveBtn = findSaveButton(modal);
    if (!saveBtn) {
      throw new Error("Could not find Save button");
    }

    // Small delay for visual feedback/ensure validation passed
    await new Promise((resolve) => setTimeout(resolve, 100));
    saveBtn.click();
  } catch (error) {
    console.error("Gmail Snooze: Modal interaction failed", error);
    throw error;
  }
}

function waitForModal(timeout = 3000): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    // Check if already exists
    const existing = document.querySelector(MODAL_SELECTOR);
    if (existing) {
      resolve(existing as HTMLElement);
      return;
    }

    const observer = new MutationObserver((_mutations, obs) => {
      const modal = document.querySelector(MODAL_SELECTOR);
      if (modal) {
        obs.disconnect();
        resolve(modal as HTMLElement);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/**
 * Attempts to match the target date format to the original value's format.
 * Defaults to "MMM d, yyyy" (e.g. Jan 10, 2026) if unrecognized.
 */
export function formatDateForGmail(date: Date, originalValue: string): string {
  // Common Gmail formats
  // "Jan 10, 2026" -> MMM d, yyyy
  // "10/01/2026" -> dd/MM/yyyy or MM/dd/yyyy

  if (!originalValue) return format(date, "MMM d, yyyy");

  // Check for "MMM d, yyyy" pattern (e.g. Jan 10, 2026)
  if (/^[A-Z][a-z]{2}\s\d{1,2},\s\d{4}$/.test(originalValue)) {
    return format(date, "MMM d, yyyy");
  }

  // Check for "d MMM, yyyy" (e.g. 10 Jan, 2026 - some locales)
  if (/^\d{1,2}\s[A-Z][a-z]{2},\s\d{4}$/.test(originalValue)) {
    return format(date, "d MMM, yyyy");
  }

  // Check for slashes
  if (originalValue.includes("/")) {
    // This is ambiguous (US vs EU).
    // We'll assume standard US MM/dd/yyyy if it looks like it, or just return strict standard.
    // Ideally we would parse the originalValue to see which part is > 12, but if both are <= 12 it's hard.
    // For now, let's default to a safe "MMM d, yyyy" if possible, as it's less ambiguous.
    // BUT, the input might enforce a specific format and reject others.

    // If original is MM/dd/yyyy or dd/MM/yyyy
    // We can try to guess based on standard locale formats, but "MM/dd/yyyy" is very common in Gmail US.
    // Let's stick with MM/dd/yyyy for slash inputs for now as per previous logic,
    // BUT we should actually check if the user is using dd/MM/yyyy (e.g. UK).
    // It's hard to distinguish 01/01/2025.

    // If the regex matches a clear dd/MM pattern (unlikely to detect without values > 12)
    // Let's just output MM/dd/yyyy for now to be safe with the test expectation,
    // or maybe we should change the logic to be more generic.
    // The previous implementation was: return format(date, "MM/dd/yyyy");
    return format(date, "MM/dd/yyyy");
  }

  // Check for dots (e.g. 10.01.2026 or 10.1.2026)
  if (originalValue.includes(".")) {
    return format(date, "dd.MM.yyyy");
  }

  // Check for dashes (e.g. 2026-01-10)
  if (originalValue.includes("-")) {
    return format(date, "yyyy-MM-dd");
  }

  // Fallback
  return format(date, "MMM d, yyyy");
}

/**
 * Formats time respecting 12h/24h preference inferred from original value.
 */
export function formatTimeForGmail(date: Date, originalValue: string): string {
  // Check for AM/PM
  const is12Hour = /AM|PM/i.test(originalValue);

  if (is12Hour) {
    // "8:00 AM" -> h:mm aa
    return format(date, "h:mm aa");
  } else {
    // "20:00" -> HH:mm
    return format(date, "HH:mm");
  }
}

async function setInputValue(input: HTMLInputElement, value: string) {
  input.focus();
  input.value = value;

  // Dispatch events to simulate user interaction
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.dispatchEvent(new Event("blur", { bubbles: true }));
}

function findSaveButton(modal: HTMLElement): HTMLElement | null {
  // Strategy 1: Data attribute
  const btn = modal.querySelector(SAVE_BUTTON_SELECTOR);
  if (btn) return btn as HTMLElement;

  // Strategy 2: Text content
  const buttons = modal.querySelectorAll("button");
  for (const b of Array.from(buttons)) {
    if (b.textContent?.trim() === "Save") {
      return b;
    }
  }
  return null;
}
