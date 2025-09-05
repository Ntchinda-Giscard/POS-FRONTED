import { Header } from "@radix-ui/react-accordion";
import React from "react";
import SiteVenteSelect from "./site-vente";
import CommandTypeSelect from "./type-select";
import ClientSelect from "./client-select";
import { Calendar28 } from "./app-datepicker";
import { Label } from "./ui/label";

type HeaderProps = {
  title?: string;
};

const HeaderCommande = (props: HeaderProps) => {
  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex flex-row gap-6">
        <SiteVenteSelect />
        <CommandTypeSelect />
        <ClientSelect />
      </div>
      <div className="flex flex-row gap-6">
        <Calendar28 />
      </div>
    </div>
  );
};

export default HeaderCommande;
