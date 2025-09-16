import { create } from "zustand";

type SiteVente = {
  code: string;
  ndescriptioname: string;
};

interface SiteVenteState {
  selectedSite: SiteVente | null;
  selectedSitetCode: string;
  sites: SiteVente[];
  setSelectedSite: (client: SiteVente) => void;
  setSelectedSitetCode: (code: string) => void;
  setSiteVente: (clients: SiteVente[]) => void;
  clearSelection: () => void;
}

const useSiteVenteStore = create<SiteVenteState>()((set, get) => ({
  selectedSite: null,
  selectedSitetCode: "",
  sites: [],

  setSelectedSite: (client: SiteVente) =>
    set({
      selectedSite: client,
      selectedSitetCode: client.code,
    }),

  setSelectedSitetCode: (code: string) => {
    const sites = get().sites;
    const client = sites.find((s) => s.code === code);
    set({
      selectedSitetCode: code,
      selectedSite: client || null,
    });
  },

  setSiteVente: (sites: SiteVente[]) => set({ sites }),

  clearSelection: () =>
    set({
      selectedSite: null,
      selectedSitetCode: "",
    }),
}));

export default useSiteVenteStore;
