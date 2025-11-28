import { create } from "zustand";

type POPServer = {
  popServer: string;
  username: string;
  port: number;
  password: string;
};

interface POPServerState {
  selectedPOPServer: POPServer | null;
  selectedPOPServerServer: string;
  popServers: POPServer;
  setSelectedPOPServer: (popServer: POPServer) => void;
  setPOPServers: (popServers: POPServer) => void;
  clearSelection: () => void;
}

const usePOPServerStore = create<POPServerState>()((set, get) => ({
  selectedPOPServer: null,
  selectedPOPServerServer: "",
  popServers: { popServer: "", username: "", port: 0, password: "" },

  setSelectedPOPServer: (popServer: POPServer) =>
    set({
      selectedPOPServer: popServer,
      selectedPOPServerServer: popServer.popServer,
    }),

  setPOPServers: (popServers: POPServer) => set({ popServers }),

  clearSelection: () =>
    set({
      selectedPOPServer: null,
      selectedPOPServerServer: "",
    }),
}));

export default usePOPServerStore;
