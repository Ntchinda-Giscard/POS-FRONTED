import { create } from "zustand";

type Client = {
  code: string;
  name: string;
};

interface ClientState {
  selectedClient: Client | null;
  selectedClientCode: string;
  clients: Client[];
  setSelectedClient: (client: Client) => void;
  setSelectedClientCode: (code: string) => void;
  setClients: (clients: Client[]) => void;
  clearSelection: () => void;
}

const useClientStore = create<ClientState>()((set, get) => ({
  selectedClient: null,
  selectedClientCode: "",
  clients: [],

  setSelectedClient: (client: Client) =>
    set({
      selectedClient: client,
      selectedClientCode: client.code,
    }),

  setSelectedClientCode: (code: string) => {
    const clients = get().clients;
    const client = clients.find((c) => c.code === code);
    set({
      selectedClientCode: code,
      selectedClient: client || null,
    });
  },

  setClients: (clients: Client[]) => set({ clients }),

  clearSelection: () =>
    set({
      selectedClient: null,
      selectedClientCode: "",
    }),
}));

export default useClientStore;
