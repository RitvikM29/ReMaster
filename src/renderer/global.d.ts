export {};

declare global {
  interface Window {
    remaster?: {
      getPlatform: () => Promise<string>;
      getActivitySnapshot: () => Promise<ActivitySnapshot>;
      applyBlocklist: (domains: string[]) => Promise<{ ok: boolean }>;
      clearBlocklist: () => Promise<{ ok: boolean }>;
      onActivityUpdate: (callback: (payload: ActivitySnapshot) => void) => (event: unknown, payload: ActivitySnapshot) => void;
      offActivityUpdate: (listener: (event: unknown, payload: ActivitySnapshot) => void) => void;
    };
  }
}

type ActivitySnapshot = {
  appName: string | null;
  title: string | null;
  ownerName: string | null;
  url: string | null;
  idleSeconds: number;
};
