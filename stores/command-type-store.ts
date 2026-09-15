import { create } from "zustand";

type CommandType = { code: string; description: string };

interface CommandTypeState {
  types: CommandType[];
  selectedTypeCode: string;
  setTypes: (types: CommandType[]) => void;
  setSelectedTypeCode: (code: string) => void;
}

// X3 sales order type (TABSOHTYP). "SON" = commande normale.
const useCommandTypeStore = create<CommandTypeState>()((set) => ({
  types: [],
  selectedTypeCode: "SON",
  setTypes: (types) => set({ types }),
  setSelectedTypeCode: (code) => set({ selectedTypeCode: code }),
}));

export default useCommandTypeStore;
