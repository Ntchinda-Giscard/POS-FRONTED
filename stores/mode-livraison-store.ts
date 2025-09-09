import { create } from "zustand";

type ModeDeLivriaison = {
  code: string;
  name: string;
};

interface ClientState {
  selectedClient: ModeDeLivriaison | null;
  selectedClientCode: string;
  modeLivraison: ModeDeLivriaison[];
  setSelectedClient: (client: ModeDeLivriaison) => void;
  setSelectedClientCode: (code: string) => void;
  setClients: (clients: ModeDeLivriaison[]) => void;
  clearSelection: () => void;
}

const useModeLivraisonStore = create<ClientState>()((set, get) => ({
  selectedClient: null,
  selectedClientCode: "",
  modeLivraison: [],

  setSelectedClient: (client: ModeDeLivriaison) =>
    set({
      selectedClient: client,
      selectedClientCode: client.code,
    }),

  setSelectedClientCode: (code: string) => {
    const clients = get().modeLivraison;
    const client = clients.find((c) => c.code === code);
    set({
      selectedClientCode: code,
      selectedClient: client || null,
    });
  },

  setClients: (modeLivraison: ModeDeLivriaison[]) => set({ modeLivraison }),

  clearSelection: () =>
    set({
      selectedClient: null,
      selectedClientCode: "",
    }),
}));

export default useModeLivraisonStore;
