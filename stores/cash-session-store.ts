import { create } from "zustand";
import { fetchCurrentCashSession, type CashSession } from "@/lib/api";

interface CashSessionState {
  session: CashSession | null;
  loading: boolean;
  loadedForSite: string | null;
  refresh: (site?: string) => Promise<CashSession | null>;
  setSession: (session: CashSession | null) => void;
}

const useCashSessionStore = create<CashSessionState>()((set) => ({
  session: null,
  loading: false,
  loadedForSite: null,
  refresh: async (site?: string) => {
    set({ loading: true });
    const response = await fetchCurrentCashSession(site);
    const session = response.success ? response.data ?? null : null;
    set({ session, loading: false, loadedForSite: site ?? null });
    return session;
  },
  setSession: (session) => set({ session }),
}));

export default useCashSessionStore;
