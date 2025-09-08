import { create } from "zustand";

interface TaxeState {
  selectTaxrCode: string;
  setTexeCode: (code: string) => void;
}

const useTierStore = create<TaxeState>()((set, get) => ({
  selectTaxrCode: "",

  setTexeCode: (code: string) => {
    set({
      selectTaxrCode: code,
    });
  },
}));

export default useTierStore;
