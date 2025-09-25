import React, { useEffect } from "react";
import { Separator } from "./ui/separator";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import useClientStore from "@/stores/client-store";
import {
  fetchCondFact,
  fetchElementFacturation,
  fetchEscomtpe,
  fetchPaymentCondition,
} from "@/lib/api";
import usePayCondStore from "@/stores/payment-condition-store";
import useEscompte from "@/stores/escompte-store";
import useCondFact from "@/stores/cond-fact";
import useElementFactStore from "@/stores/element-fact";

export default function Facturation() {
  const selectedClientCode = useClientStore(
    (state) => state.selectedClientCode
  );

  const { selectPayCondCode, setPayCondCode } = usePayCondStore();
  const { selectEscompteCode, setEscompteCode } = useEscompte();
  const { selectedCondFact, setCondFact } = useCondFact();
  const {
    selectedElementFact,
    selectedElementFactCode,
    elementFacts,
    setSelectedElementFact,
    setSelectedElementFactCode,
    setElementFacts,
  } = useElementFactStore();

  useEffect(() => {
    const loadConditioPay = async () => {
      const response = await fetchPaymentCondition(selectedClientCode);
      setPayCondCode(response.data?.code || "");
    };
    const loadEscompte = async () => {
      const response = await fetchEscomtpe(selectedClientCode);
      setEscompteCode(response.data?.code || "");
    };

    const loadCondFact = async () => {
      const response = await fetchCondFact(selectedClientCode);
      setCondFact(response.data?.code || "");
    };
    const loadElementFacturation = async () => {
      const response = await fetchElementFacturation(selectedClientCode);
      setElementFacts(response.data || []);
      console.log("Element facturation", response);
    };
    loadConditioPay();
    loadEscompte();
    loadCondFact();
    loadElementFacturation();
  }, [selectPayCondCode, elementFacts]);
  return (
    <div className="flex flex-col w-full gap-4">
      <h1> Mode facturation</h1>
      <Separator />
      <div className="w-fit min-w-[200px] flex flex-row gap-6">
        <div>
          <h2 className="text-sm"> Mode facturation </h2>
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
          <div className="flex flex-col">
            <Label className="mb-2 block">Condition de facturation</Label>
            <Input
              disabled
              className="w-[280px]"
              type="text"
              placeholder="xxx"
              value={selectedCondFact}
            />
          </div>
        </div>
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
              placeholder="xxx"
              value={selectPayCondCode}
            />
          </div>

          <div className="flex flex-col">
            <Label className="mb-2 block">Escompte</Label>
            <Input
              disabled
              className="w-[280px]"
              type="text"
              placeholder="xxx"
              value={selectEscompteCode}
            />
          </div>
        </div>
      </div>
      <Separator />
      <div>
        <h1> Element de facturation</h1>
        <div className="flex flex-col gap-4">
          {elementFacts.map((elementFact) => (
            <div
              key={elementFact.code}
              className="flex flex-row gap-4 justify-between"
            >
              <Label>{elementFact.description}</Label>
              <Input
                disabled
                onChange={(e) =>
                  setSelectedElementFactCode(
                    Number(e.target.value),
                    elementFact.code
                  )
                }
                className="w-[280px]"
                type="number"
                placeholder="xxx"
                value={elementFact.amount}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
