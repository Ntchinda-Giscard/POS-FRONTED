import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchAdresseLivraison, fetchClients } from "@/lib/api";
import { Label } from "./ui/label";
import useClientStore from "@/stores/client-store";
import useSiteLivraisonStore from "@/stores/livraison-store";

type Client = {
  code: string;
  name: string;
};

const SiteLivraison = () => {
  const selectedClientCode = useClientStore(
    (state) => state.selectedClientCode
  );
  const {
    selectedadressLivraison,
    selectedadressLivraisonCode,
    addressLivraison,
    setSelectedadressLivraison,
    setSelectedadressLivraisonCode,
    setadressLivraisons,
  } = useSiteLivraisonStore();

  useEffect(() => {
    const loadingAdresseLivraison = async () => {
      try {
        const response = await fetchAdresseLivraison(selectedClientCode);

        if (response && response.success) {
          setadressLivraisons(response.data);
          console.log("Addresse loaded:", response.data);
        }
      } catch (error) {
        console.error("Error loading adresses:", error);
      }
    };

    loadingAdresseLivraison();
  }, [setadressLivraisons, selectedClientCode]);

  const handleClientSelect = (value: string) => {
    setSelectedadressLivraisonCode(value);
    console.log("Selected client code:", value);
    console.log(
      "Selected client object:",
      useClientStore.getState().selectedClient
    );
  };

  return (
    <div className="flex flex-col">
      <Label className="mb-2 block">Adresse livraison *</Label>

      <Select
        onValueChange={handleClientSelect}
        value={selectedadressLivraisonCode}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Choisir un client" />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            <SelectLabel>Clients</SelectLabel>
            {addressLivraison?.map((addresse) => (
              <SelectItem key={addresse.code} value={addresse.code}>
                ({addresse.code})
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SiteLivraison;
