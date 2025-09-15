import { create } from "zustand";

interface PayCondState {
  selectPayCondCode: string;
  setPayCondCode: (code: string) => void;
}

const usePayCondStore = create<PayCondState>()((set, get) => ({
  selectPayCondCode: "",

  setPayCondCode: (code: string) => {
    set({
      selectPayCondCode: code,
    });
  },
}));

export default usePayCondStore;
