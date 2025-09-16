import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchAdresseVente } from "@/lib/api";
import { Label } from "./ui/label";
import useSiteVenteStore from "@/stores/site-store";

type AdresseVente = {
  code: string;
  description: string;
};

const SiteVenteSelect = () => {
  const [addressVente, setAddressVente] = useState<AdresseVente[]>([]);
  const {
    selectedSite,
    selectedSitetCode,
    sites,
    setSelectedSite,
    setSelectedSitetCode,
    setSiteVente,
  } = useSiteVenteStore();

  useEffect(() => {
    const loadingAdresseVente = async () => {
      const response = await fetchAdresseVente();

      if (response && response.success) {
        setSiteVente(response.data);
        console.log("response data site de vente:", response.data);
        // Do something with the data
      }
    };
    loadingAdresseVente();
  }, []);

  const handleSiteVente = (value: string) => {
    setSelectedSitetCode(value);
    console.log("Selected client code:", value);
    console.log(
      "Selected client object:",
      useSiteVenteStore.getState().selectedSite
    );
  };
  return (
    <div className="flex flex-col">
      <Label className="mb-2 block">Adresse de vente *</Label>
      <Select onValueChange={handleSiteVente} value={selectedSitetCode}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="choisir une adresse" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>adresse de vente</SelectLabel>
            {addressVente.map((adresse) => (
              <SelectItem key={adresse.code} value={adresse.code}>
                {adresse.description} ({adresse.code})
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SiteVenteSelect;
