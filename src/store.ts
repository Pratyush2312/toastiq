import type { ToastItem, ToastOptions, PromiseMessages } from "./types";

type Listener = () => void;
type Omit<T, K extends keyof T> = {
    [P in keyof T as P extends K ? never : P]: T[P];
};

let toasts: ToastItem[] = [];
let counter = 0;
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
        type,
        // loading toasts stay until they resolve
        duration: options.duration ?? (type === "loading" ? 0 : 3000),
        actions: options.actions ?? [],
    };

    // same id = update in place (keeps its position), otherwise add to the end
    const exists = toasts.some((t) => t.id === id);
    toasts = exists
        ? toasts.map((t) => (t.id === id ? item : t))
        : [...toasts, item];

    emit();
    return id;
}

export function dismiss(id: string) {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
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
            toast(message, { id, type: "error", duration: 5000 });
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