import { create } from "zustand";

type Transporteur = {
  code: string;
  description: string;
};

interface ClientState {
  selectedTransporteur: Transporteur | null;
  selectedTransporteurCode: string;
  transporteur: Transporteur[];
  setselectedTransporteur: (client: Transporteur) => void;
  setselectedTransporteurCode: (code: string) => void;
  setTransporteur: (clients: Transporteur[]) => void;
  clearSelection: () => void;
}

const useTransporteurStore = create<ClientState>()((set, get) => ({
  selectedTransporteur: null,
  selectedTransporteurCode: "",
  transporteur: [],

  setselectedTransporteur: (client: Transporteur) =>
    set({
      selectedTransporteur: client,
      selectedTransporteurCode: client.code,
    }),

  setselectedTransporteurCode: (code: string) => {
    const clients = get().transporteur;
    const client = clients.find((c) => c.code === code);
    set({
      selectedTransporteurCode: code,
      selectedTransporteur: client || null,
    });
  },

  setTransporteur: (transporteur: Transporteur[]) => set({ transporteur }),

  clearSelection: () =>
    set({
      selectedTransporteur: null,
      selectedTransporteurCode: "",
    }),
}));

export default useTransporteurStore;
