"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Send, SlidersHorizontal, Upload, RefreshCw, KeyRound } from "lucide-react";
import { toast } from "sonner";
import {
  changeUserPin,
  fetchAppSettings,
  fetchExportHistory,
  fetchExportPending,
  runExportToX3,
  saveAppSettings,
  type AppSettings,
  type ExportBatch,
  type ExportPending,
} from "@/lib/api";
import useUserStore from "@/stores/user-store";

/** Till settings (thresholds, receipt footer, export/SMTP) and the POS → X3 export panel. */
export function TillSettings({ site }: { site?: string }) {
  const user = useUserStore((s) => s.currentUser);
  const [settings, setSettings] = useState<AppSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<ExportPending | null>(null);
  const [history, setHistory] = useState<ExportBatch[]>([]);
  const [exporting, setExporting] = useState(false);
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [changingPin, setChangingPin] = useState(false);

  const loadExport = async () => {
    const [p, h] = await Promise.all([fetchExportPending(site), fetchExportHistory()]);
    setPending(p.success && p.data ? p.data : null);
    setHistory(h.success && h.data ? h.data : []);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const response = await fetchAppSettings();
      if (response.success && response.data) setSettings(response.data);
      setLoading(false);
      loadExport();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);

  const set = (key: string, value: string) => setSettings((s) => ({ ...s, [key]: value }));

  const save = async () => {
    setSaving(true);
    const response = await saveAppSettings(settings);
    setSaving(false);
    if (response.success && response.data) {
      setSettings(response.data);
      toast.success("Paramètres de la caisse enregistrés");
    } else toast.error("Enregistrement impossible", { description: response.error });
  };

  const exportNow = async (sendEmail: boolean) => {
    setExporting(true);
    const response = await runExportToX3(site, sendEmail);
    setExporting(false);
    if (!response.success || !response.data) {
      toast.error("Export impossible", { description: response.error });
      return;
    }
    const r = response.data;
    if (r.total_rows === 0) toast.info("Rien à exporter : Sage X3 est à jour.");
    else if (r.emailed) toast.success(`${r.total_rows} lignes exportées et envoyées à ${r.recipient}`);
    else if (r.email_error) toast.warning(`${r.total_rows} lignes exportées dans ${r.folder}`, { description: `Email non envoyé : ${r.email_error}` });
    else toast.success(`${r.total_rows} lignes exportées dans ${r.folder}`);
    loadExport();
  };

  const changePin = async () => {
    if (!user) return;
    setChangingPin(true);
    const response = await changeUserPin(user.code, oldPin, newPin);
    setChangingPin(false);
    if (response.success) {
      toast.success("Code PIN modifié");
      setOldPin("");
      setNewPin("");
    } else toast.error("Modification refusée", { description: response.error });
  };

  const isAdmin = user?.role === "admin" || user?.role === "manager";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Retour vers Sage X3</CardTitle>
          <CardDescription>
            Les commandes, livraisons et paiements créés à la caisse sont exportés en CSV (même format que la synchronisation entrante)
            puis envoyés par email à la boîte d'import X3.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">En attente :</span>
            {pending ? (
              Object.entries(pending.counts).map(([table, n]) => (
                <Badge key={table} variant={n > 0 ? "default" : "outline"}>{table} {n}</Badge>
              ))
            ) : <Loader2 className="h-4 w-4 animate-spin" />}
            <Button variant="ghost" size="sm" onClick={loadExport}><RefreshCw className="h-4 w-4" /></Button>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={() => exportNow(false)} disabled={exporting || !pending?.total}>
                {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}Exporter (fichiers)
              </Button>
              <Button onClick={() => exportNow(true)} disabled={exporting || !pending?.total || !settings.export_recipient}>
                {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}Exporter et envoyer
              </Button>
            </div>
          </div>
          {history.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Lot</TableHead><TableHead>Date</TableHead><TableHead>Contenu</TableHead><TableHead>Email</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {history.slice(0, 8).map((b) => (
                  <TableRow key={b.batch}>
                    <TableCell className="font-mono text-xs">{b.batch}</TableCell>
                    <TableCell>{new Date(b.exported_at).toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{Object.entries(b.tables).map(([t, n]) => `${t}: ${n}`).join(" · ")}</TableCell>
                    <TableCell><Badge variant={b.emailed ? "default" : "outline"}>{b.emailed ? "Envoyé" : "Fichiers"}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><SlidersHorizontal className="h-5 w-5" /> Paramètres de la caisse</CardTitle>
          <CardDescription>Seuils, ticket de caisse, export et envoi vers X3.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Seuil de stock bas (si l'article-site X3 n'a pas de stock de sécurité)">
                  <Input type="number" min="0" value={settings.low_stock_threshold ?? ""} onChange={(e) => set("low_stock_threshold", e.target.value)} disabled={!isAdmin} />
                </Field>
                <Field label="Pied de ticket">
                  <Input value={settings.receipt_footer ?? ""} onChange={(e) => set("receipt_footer", e.target.value)} disabled={!isAdmin} />
                </Field>
                <Field label="Dossier d'export (fichiers CSV pour X3)">
                  <Input value={settings.export_folder ?? ""} onChange={(e) => set("export_folder", e.target.value)} disabled={!isAdmin} />
                </Field>
                <Field label="Adresse email d'import Sage X3 (destinataire)">
                  <Input type="email" placeholder="import-x3@societe.com" value={settings.export_recipient ?? ""} onChange={(e) => set("export_recipient", e.target.value)} disabled={!isAdmin} />
                </Field>
                <Field label="Serveur SMTP (vide = déduit du serveur IMAP)">
                  <Input placeholder="smtp.gmail.com" value={settings.smtp_server ?? ""} onChange={(e) => set("smtp_server", e.target.value)} disabled={!isAdmin} />
                </Field>
                <Field label="Port SMTP (587 STARTTLS, 465 SSL)">
                  <Input type="number" value={settings.smtp_port ?? ""} onChange={(e) => set("smtp_port", e.target.value)} disabled={!isAdmin} />
                </Field>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={settings.auto_export_after_close === "1"} onCheckedChange={(v) => set("auto_export_after_close", v ? "1" : "0")} disabled={!isAdmin} />
                <Label>Exporter automatiquement vers X3 à la fermeture de caisse</Label>
              </div>
              <div className="flex justify-end">
                <Button onClick={save} disabled={saving || !isAdmin}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}Sauvegarder
                </Button>
              </div>
              {!isAdmin && <p className="text-xs text-muted-foreground">Seul un administrateur ou responsable peut modifier ces paramètres.</p>}
            </>
          )}
        </CardContent>
      </Card>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> Mon code PIN</CardTitle>
            <CardDescription>{user.name} ({user.code})</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <Field label="Ancien PIN"><Input type="password" value={oldPin} onChange={(e) => setOldPin(e.target.value)} /></Field>
            <Field label="Nouveau PIN"><Input type="password" value={newPin} onChange={(e) => setNewPin(e.target.value)} /></Field>
            <Button variant="outline" onClick={changePin} disabled={changingPin || newPin.length < 4}>
              {changingPin && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Changer le PIN
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
