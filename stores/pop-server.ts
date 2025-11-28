import { create } from "zustand";

type POPServer = {
  popServer: string;
  username: string;
  port: number;
  password: string;
};

interface POPServerState {
  selectedPOPServer: POPServer;
  setSelectedPOPServer: (popServer: Partial<POPServer>) => void;
  clearSelection: () => void;
}

const defaultPOPServer: POPServer = {
  popServer: "",
  username: "",
  port: 995,
  password: "",
};

const usePOPServerStore = create<POPServerState>()((set, get) => ({
  selectedPOPServer: defaultPOPServer,

  setSelectedPOPServer: (popServer: Partial<POPServer>) =>
    set((state) => ({
      selectedPOPServer: {
        ...state.selectedPOPServer,
        ...popServer,
      },
    })),

  clearSelection: () =>
    set({
      selectedPOPServer: defaultPOPServer,
    }),
}));

export default usePOPServerStore;
