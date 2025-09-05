import { create } from "zustand";

type AdresseLivraison = {
  code: string;
};

interface SiteLivraisonState {
  selectedadressLivraison: AdresseLivraison | null;
  selectedadressLivraisonCode: string;
  addressLivraison: AdresseLivraison[];
  setSelectedadressLivraison: (address: AdresseLivraison) => void;
  setSelectedadressLivraisonCode: (addressLivraison: string) => void;
  setadressLivraisons: (addressLivraisons: AdresseLivraison[]) => void;
}

const useSiteLivraisonStore = create<SiteLivraisonState>()((set, get) => ({
  selectedadressLivraison: null,
  selectedadressLivraisonCode: "",
  addressLivraison: [],

  setSelectedadressLivraison: (adresse: AdresseLivraison | null) => {
    set({
      selectedadressLivraison: adresse,
      selectedadressLivraisonCode: adresse ? adresse.code : "",
    });
  },
  setSelectedadressLivraisonCode: (code: string) => {
    set({ selectedadressLivraisonCode: code });
  },
  setadressLivraisons: (addressLivraisons: AdresseLivraison[]) => {
    set({ addressLivraison: addressLivraisons });
  },
  setSiteLivraisonCode: (code: string) => {
    set({ selectedadressLivraisonCode: code });
  },
  setSelectedClientCode: (code: string) => {
    const clients = get().addressLivraison;
    const client = clients.find((c) => c.code === code);
    set({
      selectedadressLivraisonCode: code,
      selectedadressLivraison: client || null,
    });
  },
}));

export default useSiteLivraisonStore;
