import { useEffect, useState, useSyncExternalStore } from "react";
import { dismiss, getToasts, subscribe } from "./store";
import type { ToastItem, ToasterProps } from "./types";

function ToastView({ item }: { item: ToastItem }) {
  const [paused, setPaused] = useState(false);

  // auto-dismiss timer; pauses while hovering, restarts when the toast updates
  useEffect(() => {
    if (paused || item.duration <= 0) return;
    const timer = setTimeout(() => dismiss(item.id), item.duration);
    return () => clearTimeout(timer);
  }, [paused, item]);

  return (
    <div
      className={`tq-toast tq-${item.type}`}
      role={item.type === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>
      {item.type === "loading" && (
        <span className="tq-spinner" aria-hidden="true" />
      )}
      <span className="tq-msg">{item.message}</span>

      {item.actions.map((action) => (
        <button
          key={action.label}
          type="button"
          className="tq-action"
          onClick={() => {
            action.onClick();
            if (action.closeOnClick !== false) dismiss(item.id);
          }}>
          {action.label}
        </button>
      ))}

      <button
        type="button"
        className="tq-close"
        aria-label="Dismiss"
        onClick={() => dismiss(item.id)}>
        ×
      </button>
    </div>
  );
}

export function Toaster({ position = "top-right" }: ToasterProps) {
  const toasts = useSyncExternalStore(subscribe, getToasts, getToasts);

  return (
    <div className={`tq-container tq-${position}`}>
      {toasts.map((t) => (
        <ToastView key={t.id} item={t} />
      ))}
    </div>
  );
}
