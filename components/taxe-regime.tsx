import React, { useEffect } from "react";
import {
  fetchClients,
  fetchCommandCurrency,
  fetchTaxRegimes,
  fetchTiers,
} from "@/lib/api";
import { Label } from "./ui/label";
import useClientStore from "@/stores/client-store";
import useTierStore from "@/stores/tier-store";
import { Input } from "./ui/input";
import useTaxeStore from "@/stores/taxe-store";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import useCurrencyStore from "@/stores/currency-store";

type Client = {
  code: string;
  name: string;
};

const TaxeRegime = () => {
  const selectedClientCode = useClientStore(
    (state) => state.selectedClientCode
  );

  const { selectTaxeCode, setTaxeCode } = useTaxeStore();
  const { selectedCurrencyCode, setCurrency } = useCurrencyStore();

  useEffect(() => {
    console.log("Selected client code changed:", selectedClientCode);
    const loadingTaxe = async () => {
      try {
        const response = await fetchTaxRegimes(selectedClientCode);
        console.log("Fetched tax regimes:", response);
        setTaxeCode(response?.data?.code || "");
        if (response && response.success) {
          console.log("Tax regimes loaded:", response.data);
        }
      } catch (error) {
        console.error("Error loading clients:", error);
      }
    };

    const loadingCurrency = async () => {
      try {
        const response = await fetchCommandCurrency(selectedClientCode);
        console.log("Fetched command currency:", response);
        setCurrency(response?.data?.code || "");
        if (response && response.success) {
          console.log("Tax regimes loaded:", response.data);
        }
      } catch (error) {
        console.error("Error loading clients:", error);
      }
    };
    loadingTaxe();
    loadingCurrency();
  }, [setTaxeCode, selectedClientCode]);

  return (
    <div className="flex flex-row gap-4">
      <div className="flex flex-col">
        <Label className="mb-2 block">Régime de taxe *</Label>
        <Input
          disabled
          className="w-[280px]"
          type="text"
          placeholder="régime de taxe"
          value={selectTaxeCode}
        />
      </div>
      <div className="flex flex-col">
        <Label className="mb-2 block">Devise *</Label>
        <Input
          disabled
          className="w-[280px]"
          type="text"
          placeholder="devise"
          value={selectedCurrencyCode}
        />
      </div>
      <div>
        <Label className="mb-2 block">Prix HT/TTC *</Label>
        <RadioGroup defaultValue="comfortable">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="default" id="r1" />
            <Label htmlFor="r1">HT</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="comfortable" id="r2" />
            <Label htmlFor="r2">TTC</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

export default TaxeRegime;
