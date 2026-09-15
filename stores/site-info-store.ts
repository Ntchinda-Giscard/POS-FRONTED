import { create } from "zustand";
import { fetchSiteInfo, type SiteInfo } from "@/lib/api";

interface SiteInfoState {
  info: SiteInfo | null;
  loadedFor: string | null;
  load: (site?: string) => Promise<SiteInfo | null>;
}

// Store identity used on receipts (FACILITY / BPADDRESS / COMPANY from the X3 sync).
const useSiteInfoStore = create<SiteInfoState>()((set, get) => ({
  info: null,
  loadedFor: null,
  load: async (site?: string) => {
    const key = site ?? "";
    if (get().loadedFor === key && get().info) return get().info;
    const response = await fetchSiteInfo(site);
    const info = response.success ? response.data ?? null : null;
    set({ info, loadedFor: key });
    return info;
  },
}));

export default useSiteInfoStore;
