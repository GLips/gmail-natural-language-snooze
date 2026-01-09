export function observeSnoozeMenu(onMenuFound: (menu: HTMLElement) => void) {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        // Handle addedNodes
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // Check if the node itself is the menu
            if (isSnoozeMenu(node)) {
              onMenuFound(node);
              return;
            }

            // Check if the menu is inside the node
            const menu = node.querySelector<HTMLElement>(
              '*[role="menu"][aria-label="Snooze menu"]',
            );
            if (menu) {
              onMenuFound(menu);
            }
          }
        });
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Check if it's already there
  const existingMenu = document.querySelector<HTMLElement>(
    '*[role="menu"][aria-label="Snooze menu"]',
  );
  if (existingMenu) {
    onMenuFound(existingMenu);
  }
}

function isSnoozeMenu(element: HTMLElement): boolean {
  return (
    element.getAttribute("role") === "menu" &&
    element.getAttribute("aria-label") === "Snooze menu"
  );
}
