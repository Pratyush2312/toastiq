# toastiq

A light-weight toast notification library for React, with promise toasts and action buttons.

## Install

```bash
npm install toastiq
```

Requires React 18 or newer.

## Usage

Import the styles once, mount `<Toaster />` once near the root of your app, then call `toast()` from anywhere.

```tsx
import { toast, Toaster } from "toastiq";
import "toastiq/styles.css";

export default function App() {
  return (
    <>
      <button onClick={() => toast.success("Saved!")}>Save</button>
      <Toaster position="top-right" />
    </>
  );
}
```

## API

```ts
toast("Hello");
toast.success("Saved");
toast.error("Something went wrong");
toast.warning("Careful");
toast.info("FYI");
toast.loading("Working...");
toast.dismiss(id);
```

Every call returns the toast's `id`.

### Action buttons

```ts
toast("File deleted", {
  duration: 6000,
  actions: [{ label: "Undo", onClick: () => restoreFile() }],
});
```

Clicking an action runs its `onClick` and closes the toast. Set `closeOnClick: false` on an action to keep the toast open.

### Promise toasts

```ts
toast.promise(saveData(), {
  loading: "Saving...",
  success: (data) => `Saved ${data.name}`,
  error: (err) => `Failed: ${(err as Error).message}`,
});
```

The toast shows a spinner while the promise runs, then changes in place to a success or error toast. The promise is returned, so you can still `await` it.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `type` | `"info" \| "success" \| "error" \| "warning" \| "loading"` | `"info"` | Toast style |
| `duration` | `number` | `3000` | Milliseconds before auto-dismiss. `0` keeps it until closed. Loading toasts default to `0`. |
| `id` | `string` | auto | Reusing an id updates that toast in place |
| `actions` | `{ label, onClick, closeOnClick? }[]` | `[]` | Buttons shown on the toast |

`<Toaster position="..." />` accepts `top-right` (default), `top-left`, `bottom-right` and `bottom-left`.

## Theming

Override the CSS variables in your own stylesheet, loaded after `toastiq/styles.css`:

```css
.tq-container {
  --tq-bg: #ffffff;
  --tq-fg: #111111;
  --tq-success: #16a34a;
}
```

Available variables: `--tq-bg`, `--tq-fg`, `--tq-muted`, `--tq-radius`, `--tq-info`, `--tq-success`, `--tq-error`, `--tq-warning`, `--tq-loading`.

## Next.js

`toastiq` works in the App Router. Mount `<Toaster />` in a layout, and import the stylesheet there too.

## License

MIT