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
import { fetchAdresseVente, fetchCommandType } from "@/lib/api";
import { Label } from "./ui/label";

type CommandType = {
  code: string;
  description: string;
};

const CommandTypeSelect = () => {
  const [commandTypes, setCommandTypes] = useState<CommandType[]>([]);
  useEffect(() => {
    const loadingCommandTypes = async () => {
      const response = await fetchCommandType();

      if (response && response.success) {
        setCommandTypes(response.data);
        console.log("response data:", response.data);
        // Do something with the data
      }
    };
    loadingCommandTypes();
  }, []);
  return (
    <div className="flex flex-col">
      <Label className="mb-2 block">Type de commande *</Label>

      <Select>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Choisir un type de commande" />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            <SelectLabel>North America</SelectLabel>
            {commandTypes.map((command) => (
              <SelectItem
                key={`${Math.floor(1000 + Math.random() * 9000)}`}
                value={command.code}
                onChange={(value) => console.log(value)}
                onSelect={(value) => console.log("Selected:", value)}
              >
                {command.description} ({command.code})
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CommandTypeSelect;
