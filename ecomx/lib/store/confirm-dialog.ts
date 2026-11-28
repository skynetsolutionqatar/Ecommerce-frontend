export type ConfirmRemovalOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "destructive" | "default";
  onConfirm: () => void;
  onCancel?: () => void;
};

type ShowConfirm = (options: ConfirmRemovalOptions) => void;

let showConfirmDialog: ShowConfirm | null = null;

export function registerConfirmDialog(handler: ShowConfirm | null): void {
  showConfirmDialog = handler;
}

/** In-app confirm sheet, same copy and actions as the mobile app. */
export function confirmRemoval(params: ConfirmRemovalOptions): void {
  if (showConfirmDialog) {
    showConfirmDialog(params);
    return;
  }

  const ok = typeof window !== "undefined" && window.confirm(`${params.title}\n\n${params.message}`);
  if (ok) params.onConfirm();
  else params.onCancel?.();
}
