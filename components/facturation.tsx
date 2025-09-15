import React, { useEffect } from "react";
import { Separator } from "./ui/separator";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import useClientStore from "@/stores/client-store";
import { fetchPaymentCondition } from "@/lib/api";
import usePayCondStore from "@/stores/payment-condition-store";
import useEscompte from "@/stores/escompte-store";

export default function Facturation() {
  const selectedClientCode = useClientStore(
    (state) => state.selectedClientCode
  );

  const { selectPayCondCode, setPayCondCode } = usePayCondStore();
  const { selectEscompteCode, setEscompteCode } = useEscompte();
  useEffect(() => {
    const loadConditioPay = async () => {
      const response = await fetchPaymentCondition(selectedClientCode);
      setPayCondCode(response.data?.code || "");
    };
    loadConditioPay();
  }, [selectPayCondCode]);
  return (
    <div className="flex flex-col w-full gap-4">
      <h1> Mode facturation</h1>
      <Separator />
      <div className="w-fit min-w-[200px] ">
        <h2 className="text-sm my-2"> Mode facturation </h2>
        <RadioGroup defaultValue="1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="1" id="r1" />
            <Label htmlFor="r1">1 fac / BL</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="2" id="r2" />
            <Label htmlFor="r2">1 fac/cde soldé</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="3" id="r3" />
            <Label htmlFor="r3">1 fac/cde</Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="4" id="r4" />
            <Label htmlFor="r4">1 fac/cli livré</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="5" id="r5" />
            <Label htmlFor="r5">1 fac/période</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="6" id="r6" />
            <Label htmlFor="r6">Fac manuelle</Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <h1> Règlement / Derniers documents</h1>
        <Separator className="my-4" />
        <div className="flex flex-row gap-4">
          <div className="flex flex-col">
            <Label className="mb-2 block">Condition paiement *</Label>
            <Input
              disabled
              className="w-[280px]"
              type="text"
              placeholder="XXX"
              value={selectPayCondCode}
            />
          </div>

          <div className="flex flex-col">
            <Label className="mb-2 block">Escompte</Label>
            <Input
              disabled
              className="w-[280px]"
              type="text"
              placeholder="XXX"
              // value={selectTaxeCode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
