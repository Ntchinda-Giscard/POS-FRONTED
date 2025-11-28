"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Folder,
  Receipt,
  CreditCard,
  Store,
  Mail,
  Loader2,
} from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import usePOPServerStore from "@/stores/pop-server";

export function SettingsForm() {
  const [folderPath, setFolderPath] = useState("");
  const [autoPrint, setAutoPrint] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currency, setCurrency] = useState("eur");
  const [taxRate, setTaxRate] = useState("20");
  const [receiptFormat, setReceiptFormat] = useState("80mm");
  const [isLoading, setIsLoading] = useState(false);
  const { selectedPOPServer, setSelectedPOPServer } = usePOPServerStore();

  const handleFolderSelect = async () => {
    if ("showDirectoryPicker" in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        setFolderPath(dirHandle.name);
      } catch (err) {
        console.log("Sélection du dossier annulée");
      }
    } else {
      alert(
        "La sélection de dossier n'est pas supportée par ce navigateur. Veuillez utiliser Chrome ou Edge."
      );
    }
  };

  const handleSubmit = (config: typeof selectedPOPServer) => {
    console.log("Submitting settings...");
    console.log("Submitting config:", config);
    setIsLoading(true);
    // Simulate an API call or some async operation
    setTimeout(() => {
      console.log("Configuration saved:", config);
      setIsLoading(false);
    }, 2000);
    console.log("Submitted config.");
  };

  return (
    <div className="space-y-6">
      {/* Store Information */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Informations du magasin
          </CardTitle>
          <CardDescription>
            Configurez les informations de votre point de vente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Nom du magasin</Label>
            <Input id="storeName" type="text" placeholder="Mon Magasin" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeAddress">Adresse</Label>
            <Input
              id="storeAddress"
              type="text"
              placeholder="123 Rue du Commerce, 75001 Paris"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siret">Numéro SIRET</Label>
            <Input id="siret" type="text" placeholder="123 456 789 00012" />
          </div>
        </CardContent>
      </Card> */}

      {/* POP server configuration */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 mr-2" />
            Paramètres POP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="">Serveur POP</Label>
              <Input
                value={selectedPOPServer?.popServer || ""}
                onChange={(e) =>
                  setSelectedPOPServer({
                    ...selectedPOPServer,
                    popServer: e.target.value,
                  })
                }
                className=""
                placeholder="pop.gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="">Port POP</Label>
              <Input
                type="number"
                value={selectedPOPServer?.port || ""}
                onChange={(e) =>
                  setSelectedPOPServer({
                    port: Number.parseInt(e.target.value) || 995,
                  })
                }
                className=""
                placeholder="995"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="">Email d'Expédition</Label>
              <Input
                type="email"
                value={selectedPOPServer?.username}
                onChange={(e) =>
                  setSelectedPOPServer({
                    ...selectedPOPServer,
                    username: e.target.value,
                  })
                }
                className=""
                placeholder="noreply@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="">Mot de Passe</Label>
              <Input
                type="password"
                value={selectedPOPServer?.password}
                onChange={(e) =>
                  setSelectedPOPServer({
                    ...selectedPOPServer,
                    password: e.target.value,
                  })
                }
                className=""
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* <div className="space-y-3">
            <Label className="">Options de Sécurité</Label>
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ssl"
                  // checked={emailConfig.useSSL}
                  // onCheckedChange={(checked) =>
                  //   setEmailConfig({ useSSL: checked as boolean })
                  // }
                />
                <Label htmlFor="ssl" className="">
                  Utiliser SSL
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tls"
                  // checked={emailConfig.useTLS}
                  // onCheckedChange={(checked) =>
                  //   setEmailConfig({ useTLS: checked as boolean })
                  // }
                />
                <Label htmlFor="tls" className="">
                  Utiliser TLS
                </Label>
              </div>
            </div>
          </div> */}
        </CardContent>
      </Card>

      {/* File Storage - Original folder selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Stockage des fichiers
          </CardTitle>
          <CardDescription>
            Configurez l'emplacement de sauvegarde de vos fichiers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder">Dossier de sauvegarde</Label>
            <div className="flex gap-2">
              <Input
                id="folder"
                type="text"
                value={folderPath}
                placeholder="Aucun dossier sélectionné"
                readOnly
                className="flex-1 bg-muted cursor-not-allowed"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleFolderSelect}
                aria-label="Sélectionner un dossier"
              >
                <Folder className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Cliquez sur l'icône pour sélectionner un dossier de destination
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={() => {
            handleSubmit(selectedPOPServer);
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Sauvegarder"
          )}
        </Button>
      </div>
    </div>
  );
}
