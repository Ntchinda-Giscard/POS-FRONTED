"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KeyRound, Loader2, LogIn, RefreshCw, UserRound } from "lucide-react";
import { toast } from "sonner";
import { fetchUsers, loginUser, type PosUser } from "@/lib/api";
import useUserStore from "@/stores/user-store";

const ROLE_LABELS: Record<PosUser["role"], string> = {
  admin: "Administrateur",
  manager: "Responsable",
  cashier: "Caissier",
};

export function LoginScreen() {
  const setUser = useUserStore((s) => s.setUser);
  const [users, setUsers] = useState<PosUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userCode, setUserCode] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = async () => {
    setLoadingUsers(true);
    setLoadError(null);
    const response = await fetchUsers();
    if (response.success && response.data) {
      setUsers(response.data);
      if (response.data.length === 0) {
        setLoadError("Aucun utilisateur actif reçu de Sage X3 (table AUTILIS). Lancez une synchronisation.");
      }
    } else {
      setLoadError(response.error ?? "Impossible de joindre le serveur local");
    }
    setLoadingUsers(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const selected = useMemo(() => users.find((u) => u.code === userCode), [users, userCode]);
  const firstLogin = !!selected && !selected.has_pin;

  const submit = async () => {
    if (!selected) return;
    if (pin.length < 4) {
      toast.error("Le code PIN doit contenir au moins 4 chiffres");
      return;
    }
    if (firstLogin && pin !== confirmPin) {
      toast.error("Les deux codes PIN ne correspondent pas");
      return;
    }
    setSubmitting(true);
    const response = await loginUser(selected.code, pin);
    setSubmitting(false);
    if (!response.success || !response.data) {
      toast.error("Connexion refusée", { description: response.error });
      setPin("");
      setConfirmPin("");
      return;
    }
    toast.success(`Bienvenue ${response.data.name}`, {
      description: firstLogin ? "Votre code PIN a été enregistré." : undefined,
    });
    setUser(response.data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <UserRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Ouverture de session</CardTitle>
          <CardDescription>
            Identifiez-vous avec votre compte Sage X3 pour utiliser la caisse.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Utilisateur</Label>
              <Button variant="ghost" size="sm" onClick={loadUsers} disabled={loadingUsers} className="h-7 px-2">
                {loadingUsers ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              </Button>
            </div>
            <Select value={userCode} onValueChange={setUserCode} disabled={loadingUsers || users.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={loadingUsers ? "Chargement des utilisateurs…" : "Choisir un utilisateur"} />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.code} value={u.code}>
                    <span className="font-mono text-xs mr-2">{u.code}</span>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}
          </div>

          {selected && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={selected.role === "admin" ? "default" : "secondary"}>{ROLE_LABELS[selected.role]}</Badge>
              {selected.profile && <span>Profil X3 : {selected.profile}</span>}
              {selected.last_login_at && (
                <span className="ml-auto">Dernière connexion {new Date(selected.last_login_at).toLocaleString()}</span>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>{firstLogin ? "Choisissez un code PIN" : "Code PIN"}</Label>
            <Input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !firstLogin && submit()}
              disabled={!selected}
            />
          </div>
          {firstLogin && (
            <div className="space-y-2">
              <Label>Confirmez le code PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                placeholder="••••"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <KeyRound className="h-3 w-3 mt-0.5" />
                Première connexion : ce code PIN sera demandé à chaque ouverture de session sur cette caisse.
              </p>
            </div>
          )}

          <Button className="w-full" size="lg" onClick={submit} disabled={!selected || submitting}>
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
            {firstLogin ? "Créer le PIN et ouvrir la session" : "Ouvrir la session"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
