import { create } from "zustand";
import { LivraisonHeader, LivraisonType } from "@/lib/api";

interface LivraisonDataState {
  livraisons: LivraisonHeader[];
  livraisonTypes: LivraisonType[];
  isLoading: boolean;
  setLivraisons: (livraisons: LivraisonHeader[]) => void;
  setLivraisonTypes: (types: LivraisonType[]) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useLivraisonDataStore = create<LivraisonDataState>((set) => ({
  livraisons: [],
  livraisonTypes: [],
  isLoading: true,
  setLivraisons: (livraisons) => set({ livraisons }),
  setLivraisonTypes: (types) => set({ livraisonTypes: types }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
