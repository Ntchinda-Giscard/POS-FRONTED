"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Moon, Sun, Monitor, Settings, Store, Receipt, Globe, MapPin, Save, Plus, Trash2 } from "lucide-react"

export function SettingsPanel() {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [autoBackup, setAutoBackup] = useState(true)
  const [language, setLanguage] = useState("fr")

  const [companyData, setCompanyData] = useState({
    name: "Retail Solutions",
    address: "123 Commerce St",
    city: "Paris",
    postalCode: "75001",
    country: "France",
    phone: "+33 1 23 45 67 89",
    email: "contact@retail.com",
    siret: "12345678901234",
    tva: "FR12345678901",
  })

  const [sites, setSites] = useState([
    { id: "MAIN", name: "Site Principal", address: "123 Commerce St, Paris" },
    { id: "DEPOT", name: "Dépôt Central", address: "456 Industrial Ave, Rungis" },
  ])

  const [newSite, setNewSite] = useState({ name: "", address: "" })

  const handleSaveCompany = () => {
    console.log("[v0] Saving company data:", companyData)
    // Here you would typically save to backend/localStorage
  }

  const handleAddSite = () => {
    if (newSite.name && newSite.address) {
      const id = newSite.name.toUpperCase().replace(/\s+/g, "_")
      setSites([...sites, { id, ...newSite }])
      setNewSite({ name: "", address: "" })
    }
  }

  const handleDeleteSite = (siteId: string) => {
    setSites(sites.filter((site) => site.id !== siteId))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres Généraux
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-sm font-medium">Langue / Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Français
                  </div>
                </SelectItem>
                <SelectItem value="en">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    English
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Theme Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Thème d'affichage</Label>

            {/* Dark/Light Toggle Switch */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-3">
                <Sun className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Mode clair</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  className="data-[state=checked]:bg-slate-900 data-[state=unchecked]:bg-yellow-400"
                />
                <Moon className="h-4 w-4 text-slate-700" />
                <span className="text-sm">Mode sombre</span>
              </div>
            </div>

            {/* System Theme Option */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Suivre le système</Label>
                  <p className="text-xs text-muted-foreground">Utiliser le thème du système d'exploitation</p>
                </div>
              </div>
              <Switch
                checked={theme === "system"}
                onCheckedChange={(checked) => setTheme(checked ? "system" : "light")}
              />
            </div>
          </div>

          <Separator />

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Notifications</Label>
              <p className="text-xs text-muted-foreground">Recevoir des notifications pour les ventes et alertes</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>

          {/* Auto Backup */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Sauvegarde automatique</Label>
              <p className="text-xs text-muted-foreground">Sauvegarder automatiquement les données</p>
            </div>
            <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Informations de l'Entreprise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nom de l'entreprise</Label>
              <Input
                id="company-name"
                value={companyData.name}
                onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siret">SIRET</Label>
              <Input
                id="siret"
                value={companyData.siret}
                onChange={(e) => setCompanyData({ ...companyData, siret: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={companyData.address}
                onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={companyData.city}
                onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal">Code postal</Label>
              <Input
                id="postal"
                value={companyData.postalCode}
                onChange={(e) => setCompanyData({ ...companyData, postalCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                value={companyData.country}
                onChange={(e) => setCompanyData({ ...companyData, country: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={companyData.phone}
                onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={companyData.email}
                onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tva">Numéro TVA</Label>
              <Input
                id="tva"
                value={companyData.tva}
                onChange={(e) => setCompanyData({ ...companyData, tva: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleSaveCompany} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder les informations
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Gestion des Sites
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Sites */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Sites existants</Label>
            {sites.map((site) => (
              <div key={site.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">
                    {site.name} ({site.id})
                  </p>
                  <p className="text-sm text-muted-foreground">{site.address}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteSite(site.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          {/* Add New Site */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Ajouter un nouveau site</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Nom du site"
                value={newSite.name}
                onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
              />
              <Input
                placeholder="Adresse du site"
                value={newSite.address}
                onChange={(e) => setNewSite({ ...newSite, address: e.target.value })}
              />
            </div>
            <Button onClick={handleAddSite} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter le site
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Configuration des Reçus
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Impression automatique</Label>
              <p className="text-xs text-muted-foreground">Imprimer automatiquement après chaque vente</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Reçus numériques</Label>
              <p className="text-xs text-muted-foreground">Proposer l'envoi par email/SMS</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
