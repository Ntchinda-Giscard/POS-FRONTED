import { create } from "zustand";

type AdresseExpedition = {
  code: string;
  description: string;
  leg_comp: string;
};

interface SiteExpeditionState {
  selectedadressExpedition: AdresseExpedition | null;
  selectedadressExpeditionCode: string;
  addressExpedition: AdresseExpedition[];
  setSelectedadressExpedition: (address: AdresseExpedition) => void;
  setSelectedadressExpeditionCode: (addressExpedition: string) => void;
  setadressExpeditions: (addressExpeditions: AdresseExpedition[]) => void;
}

const useSiteExpeditionStore = create<SiteExpeditionState>()((set, get) => ({
  selectedadressExpedition: null,
  selectedadressExpeditionCode: "",
  addressExpedition: [],

  setSelectedadressExpedition: (adresse: AdresseExpedition | null) => {
    set({
      selectedadressExpedition: adresse,
      selectedadressExpeditionCode: adresse ? adresse.code : "",
    });
  },
  setSelectedadressExpeditionCode: (code: string) => {
    set({ selectedadressExpeditionCode: code });
  },
  setadressExpeditions: (addressExpeditions: AdresseExpedition[]) => {
    set({ addressExpedition: addressExpeditions });
  },
  setSiteExpeditionCode: (code: string) => {
    set({ selectedadressExpeditionCode: code });
  },
  setSelectedClientCode: (code: string) => {
    const clients = get().addressExpedition;
    const client = clients.find((c) => c.code === code);
    set({
      selectedadressExpeditionCode: code,
      selectedadressExpedition: client || null,
    });
  },
}));

export default useSiteExpeditionStore;
