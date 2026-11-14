export type ToastType = "info" | "success" | "error" | "warning" | "loading";

export interface ToastAction {
  label: string;
  onClick: () => void;
  /** Close the toast after the click. Default: true (handled by the UI). */
  closeOnClick?: boolean;
}

export interface ToastOptions {
  type?: ToastType;
  duration?: number; // ms; 0 = stays until dismissed
  id?: string;
  actions?: ToastAction[];
}

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  actions: ToastAction[];
}

export interface PromiseMessages<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: unknown) => string);
}

export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

export interface ToasterProps {
  position?: ToastPosition;
}