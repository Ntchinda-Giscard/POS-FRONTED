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
import { saveSettingsPOP } from "@/lib/api";

export function SettingsForm() {
  const [folderPath, setFolderPath] = useState("");
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

  const handleSubmit = async () => {
    setIsLoading(true);
    await saveSettingsPOP(selectedPOPServer);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
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
              <Label>Serveur POP</Label>
              <Input
                value={selectedPOPServer.popServer}
                onChange={(e) =>
                  setSelectedPOPServer({
                    popServer: e.target.value,
                  })
                }
                placeholder="pop.gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Port POP</Label>
              <Input
                type="number"
                value={selectedPOPServer.port}
                onChange={(e) =>
                  setSelectedPOPServer({
                    port: Number.parseInt(e.target.value) || 995,
                  })
                }
                placeholder="995"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email d'Expédition</Label>
              <Input
                type="email"
                value={selectedPOPServer.username}
                onChange={(e) =>
                  setSelectedPOPServer({
                    username: e.target.value,
                  })
                }
                placeholder="noreply@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Mot de Passe</Label>
              <Input
                type="password"
                value={selectedPOPServer.password}
                onChange={(e) =>
                  setSelectedPOPServer({
                    password: e.target.value,
                  })
                }
                placeholder="••••••••"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Storage */}
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
        <Button size="lg" onClick={handleSubmit}>
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
