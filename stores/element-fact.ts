import { create } from "zustand";

type ElementFact = {
  code: string;
  amount: number;
  type: number;
  majmin: number;
  description: string;
};

interface ElementFactState {
  selectedElementFact: ElementFact | null;
  selectedElementFactCode: number;
  elementFacts: ElementFact[];
  setSelectedElementFact: (ElementFact: ElementFact) => void;
  setSelectedElementFactCode: (amount: number, code: string) => void;
  setElementFacts: (ElementFacts: ElementFact[]) => void;
  clearSelection: () => void;
}

const useElementFactStore = create<ElementFactState>()((set, get) => ({
  selectedElementFact: null,
  selectedElementFactCode: 0,
  elementFacts: [],

  setSelectedElementFact: (elementFacts: ElementFact) =>
    set({
      selectedElementFact: elementFacts,
      selectedElementFactCode: elementFacts.amount,
    }),

  setSelectedElementFactCode: (amount: number, code: string) => {
    const elementFacts = get().elementFacts;
    const updatedElementFacts = elementFacts.map((elementFact) =>
      elementFact.code === code ? { ...elementFact, amount } : elementFact
    );
    const elementFact = updatedElementFacts.find((c) => c.code === code);

    set({
      selectedElementFactCode: amount,
      selectedElementFact: elementFact || null,
      elementFacts: updatedElementFacts, // ✅ Update the array
    });
  },

  setElementFacts: (elementFacts: ElementFact[]) => set({ elementFacts }),

  clearSelection: () =>
    set({
      selectedElementFact: null,
      selectedElementFactCode: 0,
    }),
}));

export default useElementFactStore;
