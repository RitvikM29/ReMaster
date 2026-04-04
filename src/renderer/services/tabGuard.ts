import { useEffect } from "react";

export function useTabSwitchGuard(active: boolean, onReturn?: () => void) {
  useEffect(() => {
    if (!active) return;
    const handleVisibility = () => {
      if (document.hidden) return;
      onReturn?.();
    };
    const handleCustom = () => onReturn?.();
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("remaster:tab-switch", handleCustom);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("remaster:tab-switch", handleCustom);
    };
  }, [active, onReturn]);
}
