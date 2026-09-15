import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchCommandType } from "@/lib/api";
import { Label } from "./ui/label";
import useCommandTypeStore from "@/stores/command-type-store";

const CommandTypeSelect = () => {
  const { types, selectedTypeCode, setTypes, setSelectedTypeCode } = useCommandTypeStore();

  useEffect(() => {
    const loadingCommandTypes = async () => {
      const response = await fetchCommandType();
      if (response && response.success) {
        // TABSOHTYP repeats a code per legislation; keep one row per code with a description
        const seen = new Map<string, { code: string; description: string }>();
        for (const t of response.data as { code: string; description: string }[]) {
          const existing = seen.get(t.code);
          if (!existing || (!existing.description.trim() && t.description.trim())) seen.set(t.code, t);
        }
        setTypes(Array.from(seen.values()));
      }
    };
    loadingCommandTypes();
  }, [setTypes]);

  return (
    <div className="flex flex-col">
      <Label className="mb-2 block">Type de commande *</Label>
      <Select value={selectedTypeCode} onValueChange={setSelectedTypeCode}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Choisir un type de commande" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {types.map((command) => (
              <SelectItem key={command.code} value={command.code}>
                {command.description.trim() || command.code} ({command.code})
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CommandTypeSelect;
