import type { ToastItem, ToastOptions, PromiseMessages } from "./types";

type Listener = () => void;

/** Must match the exit transition in styles.css (0.25s). */
const EXIT_MS = 260;

let toasts: ToastItem[] = [];
let counter = 0;
let revision = 0;
const listeners = new Set<Listener>();

function emit() {
    listeners.forEach((l) => l());
}

export function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function getToasts() {
    return toasts;
}

export function toast(message: string, options: ToastOptions = {}): string {
    const id = options.id ?? `tq-${++counter}`;
    const type = options.type ?? "info";
    const item: ToastItem = {
        id,
        message,
        description: options.description,
        type,
        // loading toasts stay until they resolve
        duration: options.duration ?? (type === "loading" ? 0 : 4000),
        actions: options.actions ?? [],
        dismissing: false,
        rev: ++revision,
    };

    // same id = update in place (keeps its position), otherwise add to the end
    const exists = toasts.some((t) => t.id === id);
    toasts = exists
        ? toasts.map((t) => (t.id === id ? item : t))
        : [...toasts, item];

    emit();
    return id;
}

/** Dismiss one toast by id, or every toast when called without an id. */
export function dismiss(id?: string): void {
    if (id === undefined) {
        toasts.forEach((t) => dismiss(t.id));
        return;
    }

    const current = toasts.find((t) => t.id === id);
    if (!current || current.dismissing) return;

    toasts = toasts.map((t) => (t.id === id ? { ...t, dismissing: true } : t));
    emit();

    // remove after the exit animation, unless the toast was updated meanwhile
    setTimeout(() => {
        const t = toasts.find((x) => x.id === id);
        if (t?.dismissing) {
            toasts = toasts.filter((x) => x.id !== id);
            emit();
        }
    }, EXIT_MS);
}

function promise<T>(
    p: Promise<T>,
    msgs: PromiseMessages<T>,
    options: Omit<ToastOptions, "type" | "duration" | "actions"> = {}
): Promise<T> {
    const id = toast(msgs.loading, { ...options, type: "loading" });

    p.then(
        (data) => {
            const message =
                typeof msgs.success === "function" ? msgs.success(data) : msgs.success;
            toast(message, { id, type: "success" });
        },
        (err) => {
            const message =
                typeof msgs.error === "function" ? msgs.error(err) : msgs.error;
            toast(message, { id, type: "error", duration: 6000 });
        }
    );

    return p; // so callers can still `await` it
}

type Shortcut = Omit<ToastOptions, "type">;

toast.success = (m: string, o?: Shortcut) => toast(m, { ...o, type: "success" });
toast.error = (m: string, o?: Shortcut) => toast(m, { ...o, type: "error" });
toast.warning = (m: string, o?: Shortcut) => toast(m, { ...o, type: "warning" });
toast.info = (m: string, o?: Shortcut) => toast(m, { ...o, type: "info" });
toast.loading = (m: string, o?: Shortcut) => toast(m, { ...o, type: "loading" });
toast.promise = promise;
toast.dismiss = dismiss;