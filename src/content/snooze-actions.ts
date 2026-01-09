export const SNOOZE_MENU_SELECTOR = '*[role="menu"][aria-label="Snooze menu"]';
const SNOOZE_TRIGGER_SELECTORS = [
  'button[aria-label="Snooze"]',
  'div[aria-label="Snooze"]',
  '[data-tooltip="Snooze"]',
  '[aria-label*="Snooze"]',
  '[data-tooltip*="Snooze"]',
];

export function findPickDateMenuItem(menu: HTMLElement): HTMLElement | null {
  const items = menu.querySelectorAll('[role="menuitem"]');
  console.log(`Gmail Snooze: found ${items.length} menu items`);
  if (items.length === 0) return null;

  // Strategy 1: Look for specific text "Pick date & time"
  // This might be locale-dependent, but per PRD/progress we are starting with this.
  for (const item of Array.from(items)) {
    const text = item.textContent?.trim();
    console.log(`Gmail Snooze: menu item text: "${text}"`);
    if (text?.includes("Pick date & time")) {
      console.log("Gmail Snooze: found 'Pick date & time' item");
      return item as HTMLElement;
    }
  }

  // Strategy 2: Fallback to the last item as per PRD observation
  // "Last menuitem corresponds to 'Pick date & time'."
  console.log("Gmail Snooze: using last menu item as fallback");
  const lastItem = items[items.length - 1];
  return lastItem as HTMLElement;
}

export async function triggerPickDateMenu(
  menu: HTMLElement,
  timeout = 1500,
): Promise<boolean> {
  console.log("Gmail Snooze: waiting for 'Pick date & time' menu item...");
  const item = await waitForPickDateMenuItem(menu, timeout);
  if (!item) {
    console.log("Gmail Snooze: menu item not found");
    return false;
  }

  console.log("Gmail Snooze: clicking 'Pick date & time' menu item");

  // Use full activation sequence like we do for the trigger button
  dispatchActivationSequence(item);

  return true;
}

function waitForPickDateMenuItem(
  menu: HTMLElement,
  timeout: number,
): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const existing = findPickDateMenuItem(menu);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver((_mutations, obs) => {
      const candidate = findPickDateMenuItem(menu);
      if (candidate) {
        obs.disconnect();
        resolve(candidate);
      }
    });

    observer.observe(menu, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

export async function ensureSnoozeMenu(
  existingMenu?: HTMLElement,
  timeout = 3000,
): Promise<HTMLElement | null> {
  // Check if menu already exists
  const alreadyOpen = document.querySelector(SNOOZE_MENU_SELECTOR);
  if (alreadyOpen) {
    console.log("Gmail Snooze: menu already open");
    return alreadyOpen as HTMLElement;
  }

  if (existingMenu && document.contains(existingMenu)) {
    console.log("Gmail Snooze: using existing menu reference");
    return existingMenu;
  }

  const trigger = findSnoozeTrigger();
  if (!trigger) {
    console.error("Gmail Snooze: Unable to locate Snooze trigger button");
    return null;
  }

  console.log("Gmail Snooze: clicking trigger button");
  dispatchActivationSequence(trigger);
  return waitForSnoozeMenu(timeout);
}

export function waitForSnoozeMenu(timeout = 3000): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const existing = document.querySelector(SNOOZE_MENU_SELECTOR);
    if (existing) {
      console.log("Gmail Snooze: menu found immediately");
      resolve(existing as HTMLElement);
      return;
    }

    console.log("Gmail Snooze: waiting for menu to appear...");
    const observer = new MutationObserver((_mutations, obs) => {
      const menu = document.querySelector(SNOOZE_MENU_SELECTOR);
      if (menu) {
        console.log("Gmail Snooze: menu appeared");
        obs.disconnect();
        resolve(menu as HTMLElement);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      console.log("Gmail Snooze: timeout waiting for menu");
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

function findSnoozeTrigger(): HTMLElement | null {
  for (const selector of SNOOZE_TRIGGER_SELECTORS) {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) {
      console.log(`Gmail Snooze: found trigger with selector "${selector}"`);
      return element;
    }
  }
  console.log("Gmail Snooze: no trigger found with any selector");
  return null;
}

function dispatchActivationSequence(target: HTMLElement) {
  const pointerInit: PointerEventInit = {
    bubbles: true,
    cancelable: true,
    pointerId: 1,
  };
  const mouseInit: MouseEventInit = {
    bubbles: true,
    cancelable: true,
    view: window,
  };

  target.dispatchEvent(new PointerEvent("pointerdown", pointerInit));
  target.dispatchEvent(new MouseEvent("mousedown", mouseInit));
  target.dispatchEvent(new PointerEvent("pointerup", pointerInit));
  target.dispatchEvent(new MouseEvent("mouseup", mouseInit));
  target.dispatchEvent(new MouseEvent("click", mouseInit));
  target.click();
}
