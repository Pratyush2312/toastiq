import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { dismiss, getToasts, subscribe } from "./store";
import type { ToastItem, ToasterProps, ToastType } from "./types";

const SWIPE_DISTANCE = 80; // px needed to dismiss by swiping

function Icon({ type }: { type: ToastType }) {
  if (type === "loading")
    return <span className="tq-spinner" aria-hidden="true" />;

  const svg = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (type) {
    case "success":
      return (
        <svg {...svg}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8.5 12.5 2.5 2.5 4.5-5" />
        </svg>
      );
    case "error":
      return (
        <svg {...svg}>
          <circle cx="12" cy="12" r="9" />
          <path d="m9.5 9.5 5 5m0-5-5 5" />
        </svg>
      );
    case "warning":
      return (
        <svg {...svg}>
          <path d="M10.3 3.9 2.4 17.5a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4m0 3.5h.01" />
        </svg>
      );
    default:
      return (
        <svg {...svg}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5m0-8.5h.01" />
        </svg>
      );
  }
}

function ToastView({ item }: { item: ToastItem }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const paused = hovered || focused || dragging;

  const itemRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ startX: 0, dx: 0, active: false });

  // --- auto-dismiss timer that remembers how much time is left ---
  const remaining = useRef(item.duration);
  const startedAt = useRef(0);

  // a new/updated toast starts a fresh countdown (declared first so it runs first)
  useEffect(() => {
    remaining.current = item.duration;
  }, [item]);

  useEffect(() => {
    if (paused || item.dismissing || item.duration <= 0) return;
    startedAt.current = Date.now();
    const timer = setTimeout(() => dismiss(item.id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(
        0,
        remaining.current - (Date.now() - startedAt.current),
      );
    };
  }, [paused, item]);

  // --- swipe to dismiss ---
  const setDrag = (x: number, opacity: number) => {
    const el = itemRef.current;
    if (!el) return;
    el.style.setProperty("--tq-drag-x", `${x}px`);
    el.style.setProperty("--tq-drag-o", String(opacity));
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("button")) return;
    drag.current = { startX: e.clientX, dx: 0, active: true };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.dx = dx;
    setDrag(dx, Math.max(0.25, 1 - Math.abs(dx) / 240));
  };

  const endDrag = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setDragging(false);

    const { dx } = drag.current;
    if (Math.abs(dx) > SWIPE_DISTANCE) {
      setDrag(dx > 0 ? 360 : -360, 0);
      dismiss(item.id);
    } else {
      setDrag(0, 1); // spring back
    }
  };

  const timed = item.duration > 0 && !item.dismissing;

  return (
    <div
      ref={itemRef}
      className="tq-item"
      data-dismissing={item.dismissing || undefined}
      data-dragging={dragging || undefined}>
      <div className="tq-clip">
        <div
          className={`tq-toast tq-${item.type}`}
          role={item.type === "error" ? "alert" : "status"}
          data-paused={paused || undefined}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setFocused(false);
            }
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}>
          <span className="tq-icon">
            <Icon type={item.type} />
          </span>

          <div className="tq-body">
            <p className="tq-title">{item.message}</p>
            {item.description && <p className="tq-desc">{item.description}</p>}

            {item.actions.length > 0 && (
              <div className="tq-actions">
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
              </div>
            )}
          </div>

          <button
            type="button"
            className="tq-close"
            aria-label="Dismiss"
            onClick={() => dismiss(item.id)}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>

          {timed && (
            <span
              key={item.rev}
              className="tq-progress"
              style={{ animationDuration: `${item.duration}ms` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function Toaster({
  position = "top-right",
  theme = "system",
}: ToasterProps) {
  const toasts = useSyncExternalStore(subscribe, getToasts, getToasts);

  // newest toast sits closest to the screen edge
  const ordered = position.startsWith("top") ? [...toasts].reverse() : toasts;

  return (
    <div
      className={`tq-container tq-${position}`}
      data-theme={theme}
      role="region"
      aria-label="Notifications">
      {ordered.map((t) => (
        <ToastView key={t.id} item={t} />
      ))}
    </div>
  );
}
