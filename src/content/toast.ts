import { format } from "date-fns";

const TOAST_CLASS = "gmail-snooze-toast";

export function showSnoozeToast(scheduledDate: Date, messageUrl: string) {
  // Remove any existing toast
  const existing = document.querySelector(`.${TOAST_CLASS}`);
  if (existing) {
    existing.remove();
  }

  const toast = document.createElement("div");
  toast.className = TOAST_CLASS;

  // Container styling
  toast.style.position = "fixed";
  toast.style.bottom = "24px";
  toast.style.right = "24px";
  toast.style.backgroundColor = "#323232";
  toast.style.color = "white";
  toast.style.padding = "16px 20px";
  toast.style.borderRadius = "8px";
  toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  toast.style.zIndex = "10000";
  toast.style.fontFamily = "Roboto, RobotoDraft, Helvetica, Arial, sans-serif";
  toast.style.fontSize = "14px";
  toast.style.maxWidth = "400px";
  toast.style.display = "flex";
  toast.style.flexDirection = "column";
  toast.style.gap = "8px";
  toast.style.animation = "snoozeToastSlideIn 0.3s ease-out";

  // Format the date nicely
  const formattedDate = format(scheduledDate, "EEEE, MMMM d, yyyy");
  const formattedTime = format(scheduledDate, "h:mm a");

  // Content
  const title = document.createElement("div");
  title.style.fontWeight = "500";
  title.style.fontSize = "15px";
  title.textContent = "Snoozed until";

  const dateText = document.createElement("div");
  dateText.style.fontSize = "14px";
  dateText.style.opacity = "0.95";
  dateText.textContent = `${formattedDate} at ${formattedTime}`;

  const linkRow = document.createElement("div");
  linkRow.style.display = "flex";
  linkRow.style.justifyContent = "space-between";
  linkRow.style.alignItems = "center";
  linkRow.style.marginTop = "4px";

  const link = document.createElement("a");
  link.href = messageUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "View message";
  link.style.color = "#8ab4f8";
  link.style.textDecoration = "none";
  link.style.fontSize = "13px";
  link.style.cursor = "pointer";
  link.addEventListener("mouseenter", () => {
    link.style.textDecoration = "underline";
  });
  link.addEventListener("mouseleave", () => {
    link.style.textDecoration = "none";
  });
  link.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = messageUrl;
  });

  const dismissBtn = document.createElement("button");
  dismissBtn.textContent = "Dismiss";
  dismissBtn.style.background = "transparent";
  dismissBtn.style.border = "none";
  dismissBtn.style.color = "#8ab4f8";
  dismissBtn.style.cursor = "pointer";
  dismissBtn.style.fontSize = "13px";
  dismissBtn.style.padding = "4px 8px";
  dismissBtn.style.borderRadius = "4px";
  dismissBtn.addEventListener("click", () => {
    toast.remove();
  });
  dismissBtn.addEventListener("mouseenter", () => {
    dismissBtn.style.backgroundColor = "rgba(138, 180, 248, 0.1)";
  });
  dismissBtn.addEventListener("mouseleave", () => {
    dismissBtn.style.backgroundColor = "transparent";
  });

  linkRow.appendChild(link);
  linkRow.appendChild(dismissBtn);

  toast.appendChild(title);
  toast.appendChild(dateText);
  toast.appendChild(linkRow);

  // Add animation keyframes
  const style = document.createElement("style");
  style.textContent = `
    @keyframes snoozeToastSlideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes snoozeToastSlideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(toast);

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (document.body.contains(toast)) {
      toast.style.animation = "snoozeToastSlideOut 0.3s ease-in forwards";
      setTimeout(() => toast.remove(), 300);
    }
  }, 10000);
}
