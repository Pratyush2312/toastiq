export type ToastType = "info" | "success" | "error" | "warning" | "loading";

export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

export type ToastTheme = "light" | "dark" | "system";

export interface ToastAction {
  label: string;
  onClick: () => void;
  /** Close the toast after the click. Default: true. */
  closeOnClick?: boolean;
}

export interface ToastOptions {
  type?: ToastType;
  /** Optional second line shown under the message. */
  description?: string;
  /** Milliseconds before auto-dismiss. 0 keeps it until closed. */
  duration?: number;
  /** Reusing an id updates that toast in place. */
  id?: string;
  actions?: ToastAction[];
}

export interface ToastItem {
  id: string;
  message: string;
  description?: string;
  type: ToastType;
  duration: number;
  actions: ToastAction[];
  dismissing: boolean;
  /** Changes every time the toast is created or updated. */
  rev: number;
}

export interface PromiseMessages<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: unknown) => string);
}

export interface ToasterProps {
  position?: ToastPosition;
  theme?: ToastTheme;
}