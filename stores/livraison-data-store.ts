import { create } from "zustand";
import { LivraisonHeader } from "@/lib/api";

interface LivraisonDataState {
  livraisons: LivraisonHeader[];
  isLoading: boolean;
  setLivraisons: (livraisons: LivraisonHeader[]) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useLivraisonDataStore = create<LivraisonDataState>((set) => ({
  livraisons: [],
  isLoading: true,
  setLivraisons: (livraisons) => set({ livraisons }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
