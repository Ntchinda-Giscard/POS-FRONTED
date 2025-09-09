import { create } from "zustand";

interface TaxeState {
  selectTaxeCode: string;
  setTaxeCode: (code: string) => void;
}

const useTaxeStore = create<TaxeState>()((set, get) => ({
  selectTaxeCode: "",

  setTaxeCode: (code: string) => {
    set({
      selectTaxeCode: code,
    });
  },
}));

export default useTaxeStore;
