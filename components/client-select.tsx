import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchClients } from "@/lib/api";
import { Label } from "./ui/label";
import useClientStore from "@/stores/client-store";

type Client = {
  code: string;
  name: string;
};

const ClientSelect = () => {
  const {
    clients,
    selectedClientCode,
    selectedClient,
    setClients,
    setSelectedClientCode,
  } = useClientStore();

  useEffect(() => {
    const loadingClients = async () => {
      try {
        const response = await fetchClients();

        if (response && response.success) {
          setClients(response.data);
          console.log("Clients loaded:", response.data);
        }
      } catch (error) {
        console.error("Error loading clients:", error);
      }
    };

    loadingClients();
  }, [setClients]);

  const handleClientSelect = (value: string) => {
    setSelectedClientCode(value);
    console.log("Selected client code:", value);
    console.log(
      "Selected client object:",
      useClientStore.getState().selectedClient
    );
  };

  return (
    <div className="flex flex-col">
      <Label className="mb-2 block">Client *</Label>

      <Select onValueChange={handleClientSelect} value={selectedClientCode}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Choisir un client" />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            <SelectLabel>Clients</SelectLabel>
            {clients.map((client) => (
              <SelectItem key={client.code} value={client.code}>
                {client.code}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Debug info - remove in production */}
      {selectedClient && (
        <div className="mt-2 text-sm text-gray-600">{selectedClient.name}</div>
      )}
    </div>
  );
};

export default ClientSelect;
