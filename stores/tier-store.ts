import { create } from "zustand";

interface TierState {
  selectTierCode: string;
  setTierCode: (code: string) => void;
}

const useTierStore = create<TierState>()((set, get) => ({
  selectTierCode: "",

  setTierCode: (code: string) => {
    set({
      selectTierCode: code,
    });
  },
}));

export default useTierStore;
