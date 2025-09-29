import React, { useEffect } from "react";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import useSiteExpeditionStore from "@/stores/expedition-store";
import useSiteLivraisonStore from "@/stores/livraison-store";
import { fetchAdresseExpedition } from "@/lib/api";
import useSiteVenteStore from "@/stores/site-store";

export default function SiteExpedition() {
  // const handle
  const {
    addressExpedition,
    selectedadressExpeditionCode,
    selectedadressExpedition,
    setSelectedadressExpedition,
    setadressExpeditions,
    setSelectedadressExpeditionCode,
  } = useSiteExpeditionStore();

  const site = useSiteVenteStore((state) => state.selectedSite);

  useEffect(() => {
    const loadSiteExpedition = async (legacy_comp: string | undefined) => {
      const response = await fetchAdresseExpedition(legacy_comp);
      setadressExpeditions(response?.data);
      console.log(" Expedition ", addressExpedition);
    };

    loadSiteExpedition(site?.leg_comp);
  }, [site]);

  const handleSelect = (value: string) => {
    setSelectedadressExpeditionCode(value);
    console.log("Selected client code:", value);
    console.log(
      "Selected client object:",
      useSiteExpeditionStore.getState().selectedadressExpeditionCode
    );
  };
  return (
    <div className="flex flex-col w-full">
      <Label className="mb-2 block">Site expédition *</Label>
      <Select onValueChange={handleSelect} value={selectedadressExpeditionCode}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choisir un site" />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            <SelectLabel>site expédition</SelectLabel>
            {addressExpedition?.map((p) => (
              <SelectItem key={p.code} value={p.code}>
                {p.code}-{p.description}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
