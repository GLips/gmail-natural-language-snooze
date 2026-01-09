const INPUT_CLASS = "gmail-snooze-nl-input";

export function injectSnoozeInput(menu: HTMLElement) {
  // Prevent duplicate injection
  if (menu.querySelector(`.${INPUT_CLASS}`)) {
    return;
  }

  const container = document.createElement("div");
  container.className = "gmail-snooze-nl-container";
  container.style.padding = "8px 16px";
  container.style.borderBottom = "1px solid rgba(0,0,0,0.1)";

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

  // Prevent click propagation so it doesn't close the menu immediately
  input.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  input.addEventListener("keydown", (e) => {
    e.stopPropagation(); // specific key handling later
  });

  container.appendChild(input);

  // Insert at the top of the menu
  menu.insertBefore(container, menu.firstChild);

  // Auto-focus the input
  setTimeout(() => input.focus(), 50);
}
