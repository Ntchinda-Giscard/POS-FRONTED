import { create } from "zustand";

type ModeDeLivriaison = {
  code: string;
};

interface ClientState {
  selectedModeLivraison: ModeDeLivriaison | null;
  selectedModeLivraisonCode: string;
  modeLivraison: ModeDeLivriaison[];
  setselectedModeLivraison: (client: ModeDeLivriaison) => void;
  setselectedModeLivraisonCode: (code: string) => void;
  setModeLivraison: (clients: ModeDeLivriaison[]) => void;
  clearSelection: () => void;
}

const useModeLivraisonStore = create<ClientState>()((set, get) => ({
  selectedModeLivraison: null,
  selectedModeLivraisonCode: "",
  modeLivraison: [],

  setselectedModeLivraison: (client: ModeDeLivriaison) =>
    set({
      selectedModeLivraison: client,
      selectedModeLivraisonCode: client.code,
    }),

  setselectedModeLivraisonCode: (code: string) => {
    const clients = get().modeLivraison;
    const client = clients.find((c) => c.code === code);
    set({
      selectedModeLivraisonCode: code,
      selectedModeLivraison: client || null,
    });
  },

  setModeLivraison: (modeLivraison: ModeDeLivriaison[]) =>
    set({ modeLivraison }),

  clearSelection: () =>
    set({
      selectedModeLivraison: null,
      selectedModeLivraisonCode: "",
    }),
}));

export default useModeLivraisonStore;
