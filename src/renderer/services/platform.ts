import { ActivitySnapshot } from "@/types";

const emptySnapshot: ActivitySnapshot = {
  appName: null,
  title: null,
  ownerName: null,
  url: null,
  idleSeconds: 0
};

type RemasterBridge = typeof window extends { remaster: infer R } ? R : never;

type Bridge = RemasterBridge & {
  getActivitySnapshot?: () => Promise<ActivitySnapshot>;
  onActivityUpdate?: (callback: (payload: ActivitySnapshot) => void) => (event: unknown, payload: ActivitySnapshot) => void;
  offActivityUpdate?: (listener: (event: unknown, payload: ActivitySnapshot) => void) => void;
  applyBlocklist?: (domains: string[]) => Promise<{ ok: boolean }>;
  clearBlocklist?: () => Promise<{ ok: boolean }>;
};

const bridge = (typeof window !== "undefined" ? (window.remaster as Bridge | undefined) : undefined) ?? undefined;

export const isElectron = Boolean(bridge);

export const platform = {
  async getActivitySnapshot() {
    if (bridge?.getActivitySnapshot) return bridge.getActivitySnapshot();
    return emptySnapshot;
  },
  onActivityUpdate(callback: (payload: ActivitySnapshot) => void) {
    if (bridge?.onActivityUpdate) return bridge.onActivityUpdate(callback);
    return () => undefined;
  },
  offActivityUpdate(listener: (event: unknown, payload: ActivitySnapshot) => void) {
    if (bridge?.offActivityUpdate) bridge.offActivityUpdate(listener);
  },
  async applyBlocklist(domains: string[]) {
    if (bridge?.applyBlocklist) return bridge.applyBlocklist(domains);
    return { ok: false };
  },
  async clearBlocklist() {
    if (bridge?.clearBlocklist) return bridge.clearBlocklist();
    return { ok: false };
  }
};
