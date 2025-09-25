import { create } from "zustand";

type ElementFact = {
  code: string;
  name: string;
  mode_fac: string;
};

interface ElementFactState {
  selectedElementFact: ElementFact | null;
  selectedElementFactCode: string;
  elementFacts: ElementFact[];
  setSelectedElementFact: (ElementFact: ElementFact) => void;
  setSelectedElementFactCode: (code: string) => void;
  setElementFacts: (ElementFacts: ElementFact[]) => void;
  clearSelection: () => void;
}

const useElementFactStore = create<ElementFactState>()((set, get) => ({
  selectedElementFact: null,
  selectedElementFactCode: "",
  elementFacts: [],

  setSelectedElementFact: (elementFacts: ElementFact) =>
    set({
      selectedElementFact: elementFacts,
      selectedElementFactCode: elementFacts.code,
    }),

  setSelectedElementFactCode: (code: string) => {
    const elementFacts = get().elementFacts;
    const elementFact = elementFacts.find((c) => c.code === code);
    set({
      selectedElementFactCode: code,
      selectedElementFact: elementFact || null,
    });
  },

  setElementFacts: (elementFacts: ElementFact[]) => set({ elementFacts }),

  clearSelection: () =>
    set({
      selectedElementFact: null,
      selectedElementFactCode: "",
    }),
}));

export default useElementFactStore;
