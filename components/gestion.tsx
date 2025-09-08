import React from "react";
import { Separator } from "./ui/separator";
import ClientLivreSelect from "./client-livre-select";
import PayeurSelect from "./payeur-select";
import SiteLivraison from "./site-livraison";

export default function GestionCommande() {
  return (
    <div>
      <h2> Tiers </h2>
      <Separator className="my-4" />
      <div className="flex flex-row gap-4">
        <ClientLivreSelect />
        <PayeurSelect />
        <SiteLivraison />
      </div>
      <h2 className="mt-5"> Gestion et taxes</h2>
      <Separator className="my-4" />
    </div>
  );
}
