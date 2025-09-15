import { create } from "zustand";

interface ConFacState {
  selectedCondFact: string;
  setCondFact: (code: string) => void;
}

const useCondFact = create<ConFacState>()((set, get) => ({
  selectedCondFact: "",

  setCondFact: (code: string) => {
    set({
      selectedCondFact: code,
    });
  },
}));

export default useCondFact;
