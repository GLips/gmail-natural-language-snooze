export function findPickDateMenuItem(menu: HTMLElement): HTMLElement | null {
  const items = menu.querySelectorAll('[role="menuitem"]');
  if (items.length === 0) return null;

  // Strategy 1: Look for specific text "Pick date & time"
  // This might be locale-dependent, but per PRD/progress we are starting with this.
  for (const item of Array.from(items)) {
    if (item.textContent?.includes("Pick date & time")) {
      return item as HTMLElement;
    }
  }

  // Strategy 2: Fallback to the last item as per PRD observation
  // "Last menuitem corresponds to 'Pick date & time'."
  const lastItem = items[items.length - 1];
  return lastItem as HTMLElement;
}

export function triggerPickDateMenu(menu: HTMLElement): boolean {
  const item = findPickDateMenuItem(menu);
  if (item) {
    // Dispatch a mousedown/click combo to ensure Gmail registers it
    const mouseDown = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    const click = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    });

    item.dispatchEvent(mouseDown);
    item.dispatchEvent(click);
    return true;
  }
  return false;
}
