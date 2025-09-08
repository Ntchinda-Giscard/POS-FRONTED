import React, { useEffect } from "react";
import { fetchClients, fetchTiers } from "@/lib/api";
import { Label } from "./ui/label";
import useClientStore from "@/stores/client-store";
import useTierStore from "@/stores/tier-store";
import { Input } from "./ui/input";

type Client = {
  code: string;
  name: string;
};

const TaxeRegime = () => {
  const selectedClientCode = useClientStore(
    (state) => state.selectedClientCode
  );

  const { selectTierCode, setTierCode } = useTierStore();

  useEffect(() => {
    console.log("Selected client code changed:", selectedClientCode);
    const loadingClients = async () => {
      try {
        const response = await fetchTiers(selectedClientCode);
        console.log("Fetched tiers:", response);
        setTierCode(response?.data.code || "");
        if (response && response.success) {
          console.log("Clients loaded:", response.data);
        }
      } catch (error) {
        console.error("Error loading clients:", error);
      }
    };
    loadingClients();
  }, [setTierCode]);

  return (
    <div className="flex flex-col">
      <Label className="mb-2 block">Client facture *</Label>
      <Input
        disabled
        className="w-[280px]"
        type="email"
        placeholder="Email"
        value={selectTierCode}
      />
    </div>
  );
};

export default TaxeRegime;
