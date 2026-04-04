const listeners = new Set<() => void>();

export function emitSessionChange() {
  listeners.forEach((listener) => listener());
}

export function subscribeSessionChange(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
