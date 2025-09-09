import { create } from "zustand";

interface CurState {
  selectedCurrencyCode: string;
  setCurrency: (code: string) => void;
}

const useCurrencyStore = create<CurState>()((set, get) => ({
  selectedCurrencyCode: "",

  setCurrency: (code: string) => {
    set({
      selectedCurrencyCode: code,
    });
  },
}));

export default useCurrencyStore;
