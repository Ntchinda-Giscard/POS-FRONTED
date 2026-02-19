import { create } from "zustand";

export type POPServer = {
  popServer: string;
  username: string;
  port: number;
  password: string;
  addressVente: string;
  siteLivraison: string;
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
  addressVente: "",
  siteLivraison: "",
};

const usePOPServerStore = create<POPServerState>()((set, get) => {
  console.log("Store initialized"); // Add this

  return {
    selectedPOPServer: defaultPOPServer,

    setSelectedPOPServer: (popServer: Partial<POPServer>) => {
      console.log("setSelectedPOPServer called with:", popServer); // Add this
      set((state) => ({
        selectedPOPServer: {
          ...state.selectedPOPServer,
          ...popServer,
        },
      }));
    },

    clearSelection: () =>
      set({
        selectedPOPServer: defaultPOPServer,
      }),
  };
});

export default usePOPServerStore;
