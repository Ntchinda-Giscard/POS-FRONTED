import React from "react";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import useSiteExpeditionStore from "@/stores/expedition-store";

export default function SiteExpedition() {
  // const handle
  const {
    addressExpedition,
    selectedadressExpeditionCode,
    selectedadressExpedition,
    setSelectedadressExpedition,
    setSelectedadressExpeditionCode,
  } = useSiteExpeditionStore();

  return (
    <div className="flex flex-col w-full">
      <Label className="mb-2 block">Site expédition *</Label>
      <Select
      //   onValueChange={handlePriority}
      //   value={selectedPriority}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choisir une priorité" />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            <SelectLabel>site expédition</SelectLabel>
            {/* {expedition.map((p) => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.name}
                  </SelectItem>
                ))} */}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
