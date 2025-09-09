import React from "react";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { DateTimePicker } from "./date-time-picker";
import { DateNumberPicker } from "./date-delay-picker";
import useModeLivraisonStore from "@/stores/mode-livraison-store";
import { fetchModeLivraison, fetchTransporteur } from "@/lib/api";
import useTransporteurStore from "@/stores/transporteur";

export default function Livraison() {
  const [selectedPriority, setSelectedPriority] = React.useState<string>("");
  const {
    modeLivraison,
    selectedModeLivraisonCode,
    selectedModeLivraison,
    setModeLivraison,
    setselectedModeLivraisonCode,
  } = useModeLivraisonStore();

  const {
    transporteur,
    selectedTransporteurCode,
    selectedTransporteur,
    setTransporteur,
    setselectedTransporteurCode,
  } = useTransporteurStore();

  React.useEffect(() => {
    const loadingClients = async () => {
      try {
        const response = await fetchModeLivraison();

        if (response && response.success) {
          setModeLivraison(response.data);
          console.log("Clients loaded:", response.data);
        }
      } catch (error) {
        console.error("Error loading clients:", error);
      }
    };

    const loadTransporteur = async () => {
      try {
        const response = await fetchTransporteur();

        if (response && response.success) {
          setModeLivraison(response.data);
          console.log("Clients loaded:", response.data);
        }
      } catch (error) {
        console.error("Error loading clients:", error);
      }
    };

    loadingClients();
    loadTransporteur();
  }, [setModeLivraison]);

  const handlePriority = (value: string) => {
    console.log("Selected priority:", value);
    setSelectedPriority(value);
  };

  const handleModeLivraison = (value: string) => {
    setselectedModeLivraisonCode(value);
    console.log("Selected client code:", value);
    console.log(
      "Selected client object:",
      useTransporteurStore.getState().selectedTransporteur
    );
  };

  const handleTransporteur = (value: string) => {
    setselectedTransporteurCode(value);
    console.log("Selected client code:", value);
    console.log(
      "Selected client object:",
      useModeLivraisonStore.getState().selectedModeLivraisonCode
    );
  };

  const priority = [
    { code: "1", name: "Normal" },
    { code: "2", name: "Urgent" },
    { code: "3", name: "Très urgent" },
  ];
  const tour = [
    { code: "1", name: "Tournée 1" },
    { code: "2", name: "Tournée 2" },
    { code: "3", name: "Tournée 3" },
    { code: "4", name: "Tournée 4" },
  ];

  const expedition = [];
  return (
    <div>
      <h2> Expédition </h2>
      <Separator className="my-4" />
      <div className="flex flex-row gap-4">
        <div className="flex flex-col">
          <Label className="mb-2 block">Site expédition *</Label>
          <Select onValueChange={handlePriority} value={selectedPriority}>
            <SelectTrigger className="w-[280px]">
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

        <div className="flex flex-col">
          <Label className="mb-2 block">Priorité livraison</Label>
          <Select onValueChange={handlePriority} value={selectedPriority}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Choisir une priorité" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>Priorités</SelectLabel>
                {priority.map((p) => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <h2 className="mt-4"> Dates </h2>
      <Separator className="my-4" />
      <div className="my-4">
        <DateNumberPicker />
        <DateTimePicker />
      </div>

      <h2 className="mt-4"> Transport </h2>
      <Separator className="my-4" />
      <div className="flex flex-row gap-4">
        <div className="flex flex-col">
          <Label className="mb-2 block">No tournée</Label>
          <Select onValueChange={handlePriority} value={selectedPriority}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Choisir une priorité" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>tournée</SelectLabel>
                {tour.map((p) => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {/* Mode de livraison */}
        <div className="flex flex-col">
          <Label className="mb-2 block">Mode livraison</Label>
          <Select
            onValueChange={handleModeLivraison}
            value={selectedModeLivraisonCode}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Choisir un mode de livraison" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>mode livraison</SelectLabel>
                {modeLivraison.map((p) => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.code}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {/* transporteur */}
        <div className="flex flex-col">
          <Label className="mb-2 block">Transporteur</Label>
          <Select
            onValueChange={handleTransporteur}
            value={selectedTransporteurCode}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Choisir une priorité" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>transporteur</SelectLabel>
                {transporteur.map((p) => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.description}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
