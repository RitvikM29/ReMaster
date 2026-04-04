import { useEffect } from "react";

const STORAGE_KEY = "remaster.focus.active";

export function setFocusActiveMode(mode: string) {
  localStorage.setItem(STORAGE_KEY, mode);
}

export function clearFocusActiveMode(mode: string) {
  if (localStorage.getItem(STORAGE_KEY) === mode) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function isFocusActive() {
  return Boolean(localStorage.getItem(STORAGE_KEY));
}

export function useBeforeUnloadGuard(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [active]);
}
