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

type AdresseVente = {
  code: string;
  description: string;
};

const SiteVenteSelect = () => {
  const [addressVente, setAddressVente] = useState<AdresseVente[]>([]);
  useEffect(() => {
    const loadingAdresseVente = async () => {
      const response = await fetchAdresseVente();

      if (response && response.success) {
        setAddressVente(response.data);
        console.log("response data site de vente:", response.data);
        // Do something with the data
      }
    };
    loadingAdresseVente();
  }, []);
  return (
    <div className="flex flex-col">
      <Label className="mb-2 block">Adresse de vente *</Label>
      <Select>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="choisir une adresse" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>North America</SelectLabel>
            {addressVente.map((adresse) => (
              <SelectItem
                key={adresse.code}
                value={adresse.code}
                onChange={(value) => console.log(value)}
                onSelect={(value) => console.log("Selected:", value)}
              >
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
