"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus } from "lucide-react";
import type { DeliveryLocation } from "@/types/pos";

interface DeliveryLocationSelectorProps {
  selectedLocation: DeliveryLocation | undefined;
  onLocationSelect: (location: DeliveryLocation) => void;
}

const mockLocations: DeliveryLocation[] = [
  {
    id: "1",
    name: "Magasin Principal",
    address: "123 Commerce St, Paris",
    isActive: true,
    code: "",
    isDefault: false,
  },
  {
    id: "2",
    name: "Entrepôt Nord",
    address: "456 Industrial Ave, Lille",
    isActive: true,
    code: "",
    isDefault: false,
  },
  {
    id: "3",
    name: "Point Relais Sud",
    address: "789 Market Rd, Lyon",
    isActive: true,
    code: "",
    isDefault: false,
  },
  {
    id: "4",
    name: "Livraison à Domicile",
    address: "Service de livraison",
    isActive: true,
    code: "",
    isDefault: false,
  },
];

export function DeliveryLocationSelector({
  selectedLocation,
  onLocationSelect,
}: DeliveryLocationSelectorProps) {
  const [showAll, setShowAll] = useState(false);

  const displayedLocations = showAll
    ? mockLocations
    : mockLocations.slice(0, 3);

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4" />
          Site de Livraison
          <Badge variant="destructive" className="ml-auto text-xs">
            Obligatoire
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {displayedLocations.map((location) => (
          <Button
            key={location.id}
            variant={
              selectedLocation?.id === location.id ? "default" : "outline"
            }
            className="w-full justify-start h-auto p-3 transition-all duration-200 hover:scale-[1.02]"
            onClick={() => onLocationSelect(location)}
          >
            <div className="text-left">
              <div className="font-medium text-sm">{location.name}</div>
              <div className="text-xs text-muted-foreground">
                {location.address}
              </div>
            </div>
            {selectedLocation?.id === location.id && (
              <Badge variant="secondary" className="ml-auto">
                Sélectionné
              </Badge>
            )}
          </Button>
        ))}

        {mockLocations.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll
              ? "Voir moins"
              : `Voir ${mockLocations.length - 3} autres sites`}
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 bg-transparent"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un site
        </Button>
      </CardContent>
    </Card>
  );
}
