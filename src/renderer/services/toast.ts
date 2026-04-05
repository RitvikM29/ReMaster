type ToastTone = "success" | "error" | "info";

export function showToast(message: string, tone: ToastTone = "success") {
  window.dispatchEvent(
    new CustomEvent("remaster:toast", {
      detail: { message, tone }
    })
  );
}
