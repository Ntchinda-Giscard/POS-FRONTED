import React from "react";
import { Separator } from "./ui/separator";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

export default function Facturation() {
  return (
    <div>
      <div>
        <h1>Mode facturation</h1>
        <Separator className="my-4" />
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
    </div>
  );
}
