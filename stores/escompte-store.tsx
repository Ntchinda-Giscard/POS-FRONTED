import { create } from "zustand";

interface EscompteState {
  selectEscompteCode: string;
  setEscompteCode: (code: string) => void;
}

const useEscompte = create<EscompteState>()((set, get) => ({
  selectEscompteCode: "",

  setEscompteCode: (code: string) => {
    set({
      selectEscompteCode: code,
    });
  },
}));

export default useEscompte;
