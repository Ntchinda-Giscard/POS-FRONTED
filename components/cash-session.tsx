"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownToLine, ArrowUpFromLine, Loader2, Lock, Unlock, Wallet } from "lucide-react";
import { toast } from "sonner";
import {
  addCashMovement,
  closeCashSession,
  fetchCashSessions,
  openCashSession,
  type CashSession,
} from "@/lib/api";
import useCashSessionStore from "@/stores/cash-session-store";
import useUserStore from "@/stores/user-store";
import { getCurrencyByCode } from "@/lib/utils";

const METHOD_LABELS: Record<string, string> = { cash: "Espèces", card: "Carte", digital: "Mobile money" };

export function money(value: number | null | undefined, currency?: string | null) {
  const symbol = currency ? getCurrencyByCode(currency)?.symbol ?? `${currency} ` : "";
  return `${symbol}${(value ?? 0).toFixed(2)}`;
}

/** Dialog to open the till (fond de caisse). */
export function OpenCashDialog({
  open,
  onOpenChange,
  site,
  currency,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: string;
  currency?: string;
}) {
  const user = useUserStore((s) => s.currentUser);
  const setSession = useCashSessionStore((s) => s.setSession);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user) return;
    const opening = Number(amount);
    if (Number.isNaN(opening) || opening < 0) {
      toast.error("Fond de caisse invalide");
      return;
    }
    setBusy(true);
    const response = await openCashSession({ site, user_code: user.code, opening_amount: opening, currency, notes: notes || undefined });
    setBusy(false);
    if (!response.success || !response.data) {
      toast.error("Ouverture impossible", { description: response.error });
      return;
    }
    setSession(response.data);
    toast.success(`Caisse ouverte avec ${money(opening, currency)}`);
    setAmount("");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Unlock className="h-4 w-4" /> Ouvrir la caisse</DialogTitle>
          <DialogDescription>Site {site || "—"} · caissier {user?.name ?? "—"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Fond de caisse (espèces présentes à l'ouverture)</Label>
            <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" autoFocus />
          </div>
          <div className="space-y-2">
            <Label>Remarque (optionnel)</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex : caisse n°1, matin" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={busy || !site || !user}>
            {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Ouvrir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Dialog to close the till: count the drawer, see expected vs counted. */
export function CloseCashDialog({
  open,
  onOpenChange,
  session,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: CashSession | null;
}) {
  const user = useUserStore((s) => s.currentUser);
  const setSession = useCashSessionStore((s) => s.setSession);
  const [counted, setCounted] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const countedNumber = Number(counted);
  const difference = session && counted !== "" && !Number.isNaN(countedNumber) ? countedNumber - session.expected_amount : null;

  const submit = async () => {
    if (!session) return;
    if (counted === "" || Number.isNaN(countedNumber) || countedNumber < 0) {
      toast.error("Saisissez le montant compté");
      return;
    }
    setBusy(true);
    const response = await closeCashSession(session.id, { closing_amount: countedNumber, user_code: user?.code, notes: notes || undefined });
    setBusy(false);
    if (!response.success || !response.data) {
      toast.error("Fermeture impossible", { description: response.error });
      return;
    }
    const diff = response.data.difference ?? 0;
    toast.success("Caisse fermée", {
      description: diff === 0 ? "Aucun écart." : `Écart de ${money(diff, session.currency)}`,
    });
    setSession(null);
    setCounted("");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Lock className="h-4 w-4" /> Fermer la caisse</DialogTitle>
          <DialogDescription>Comptez les espèces présentes dans le tiroir.</DialogDescription>
        </DialogHeader>
        {session && (
          <div className="space-y-4">
            <div className="rounded-md border p-3 text-sm space-y-1">
              <div className="flex justify-between"><span>Fond de caisse</span><span className="font-mono">{money(session.opening_amount, session.currency)}</span></div>
              <div className="flex justify-between"><span>Ventes en espèces</span><span className="font-mono">{money(session.cash_sales, session.currency)}</span></div>
              <div className="flex justify-between"><span>Apports</span><span className="font-mono">+{money(session.cash_in, session.currency)}</span></div>
              <div className="flex justify-between"><span>Retraits</span><span className="font-mono">-{money(session.cash_out, session.currency)}</span></div>
              <Separator className="my-1" />
              <div className="flex justify-between font-semibold"><span>Espèces attendues</span><span className="font-mono">{money(session.expected_amount, session.currency)}</span></div>
            </div>
            <div className="space-y-2">
              <Label>Montant compté</Label>
              <Input type="number" min="0" step="0.01" value={counted} onChange={(e) => setCounted(e.target.value)} placeholder="0.00" autoFocus />
            </div>
            {difference !== null && (
              <div className={`flex justify-between font-semibold ${difference === 0 ? "text-green-600" : difference < 0 ? "text-destructive" : "text-orange-600"}`}>
                <span>Écart</span>
                <span className="font-mono">{difference > 0 ? "+" : ""}{money(difference, session.currency)}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label>Remarque</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Explication de l'écart, incident…" />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button variant="destructive" onClick={submit} disabled={busy || !session}>
            {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Fermer la caisse
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Add cash to / remove cash from the drawer. */
export function CashMovementDialog({
  open,
  onOpenChange,
  session,
  type,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: CashSession | null;
  type: "in" | "out";
}) {
  const user = useUserStore((s) => s.currentUser);
  const setSession = useCashSessionStore((s) => s.setSession);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!session) return;
    const value = Number(amount);
    if (Number.isNaN(value) || value <= 0) {
      toast.error("Montant invalide");
      return;
    }
    setBusy(true);
    const response = await addCashMovement(session.id, { type, amount: value, reason: reason || undefined, user_code: user?.code });
    setBusy(false);
    if (!response.success || !response.data) {
      toast.error("Mouvement refusé", { description: response.error });
      return;
    }
    setSession(response.data);
    toast.success(type === "in" ? "Apport enregistré" : "Retrait enregistré");
    setAmount("");
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "in" ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}
            {type === "in" ? "Apport d'espèces" : "Retrait d'espèces"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Montant</Label>
            <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2">
            <Label>Motif</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={type === "in" ? "Ex : monnaie" : "Ex : achat fournitures"} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={busy}>{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Valider</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Full "Caisse" view: current session with movements + history of closed sessions. */
export function CashSessionView({ site, currency }: { site: string; currency?: string }) {
  const { session, refresh } = useCashSessionStore();
  const [history, setHistory] = useState<CashSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [closeDialog, setCloseDialog] = useState(false);
  const [movement, setMovement] = useState<"in" | "out" | null>(null);

  const loadHistory = async () => {
    setLoadingHistory(true);
    const response = await fetchCashSessions(site || undefined, 30);
    setHistory(response.success && response.data ? response.data : []);
    setLoadingHistory(false);
  };

  useEffect(() => {
    refresh(site || undefined);
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);

  useEffect(() => {
    if (!closeDialog && !openDialog) loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, session?.status]);

  const cur = session?.currency ?? currency;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5" /> Caisse {site || ""}</CardTitle>
            <CardDescription>
              {session ? `Ouverte le ${new Date(session.opened_at).toLocaleString()} par ${session.user_code}` : "Aucune session ouverte"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {session ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setMovement("in")}><ArrowDownToLine className="h-4 w-4 mr-1" />Apport</Button>
                <Button variant="outline" size="sm" onClick={() => setMovement("out")}><ArrowUpFromLine className="h-4 w-4 mr-1" />Retrait</Button>
                <Button variant="destructive" size="sm" onClick={() => setCloseDialog(true)}><Lock className="h-4 w-4 mr-1" />Fermer</Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setOpenDialog(true)} disabled={!site}><Unlock className="h-4 w-4 mr-1" />Ouvrir la caisse</Button>
            )}
          </div>
        </CardHeader>
        {session && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <Stat label="Fond de caisse" value={money(session.opening_amount, cur)} />
              <Stat label="Ventes espèces" value={money(session.cash_sales, cur)} />
              <Stat label="Apports / retraits" value={`+${money(session.cash_in, cur)} / -${money(session.cash_out, cur)}`} />
              <Stat label="Espèces attendues" value={money(session.expected_amount, cur)} strong />
              <Stat label="Paiements" value={`${session.payments_count}`} />
            </div>
            {Object.keys(session.sales_by_method).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(session.sales_by_method).map(([m, total]) => (
                  <Badge key={m} variant="outline">{METHOD_LABELS[m] ?? m} : {money(total, cur)}</Badge>
                ))}
              </div>
            )}
            {session.movements.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Mouvements</h4>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Heure</TableHead><TableHead>Type</TableHead><TableHead>Motif</TableHead><TableHead>Par</TableHead><TableHead className="text-right">Montant</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {session.movements.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>{new Date(m.created_at).toLocaleTimeString()}</TableCell>
                        <TableCell><Badge variant={m.type === "in" ? "default" : "secondary"}>{m.type === "in" ? "Apport" : "Retrait"}</Badge></TableCell>
                        <TableCell>{m.reason ?? "—"}</TableCell>
                        <TableCell>{m.user_code ?? "—"}</TableCell>
                        <TableCell className="text-right font-mono">{m.type === "in" ? "+" : "-"}{money(m.amount, cur)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des sessions</CardTitle>
          <CardDescription>Ouvertures, fermetures et écarts de caisse</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune session enregistrée.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ouverture</TableHead><TableHead>Fermeture</TableHead><TableHead>Caissier</TableHead>
                    <TableHead className="text-right">Fond</TableHead><TableHead className="text-right">Ventes esp.</TableHead>
                    <TableHead className="text-right">Attendu</TableHead><TableHead className="text-right">Compté</TableHead>
                    <TableHead className="text-right">Écart</TableHead><TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{new Date(s.opened_at).toLocaleString()}</TableCell>
                      <TableCell>{s.closed_at ? new Date(s.closed_at).toLocaleString() : "—"}</TableCell>
                      <TableCell>{s.user_code}{s.closed_by && s.closed_by !== s.user_code ? ` / ${s.closed_by}` : ""}</TableCell>
                      <TableCell className="text-right font-mono">{money(s.opening_amount, s.currency)}</TableCell>
                      <TableCell className="text-right font-mono">{money(s.cash_sales, s.currency)}</TableCell>
                      <TableCell className="text-right font-mono">{money(s.expected_amount, s.currency)}</TableCell>
                      <TableCell className="text-right font-mono">{s.closing_amount != null ? money(s.closing_amount, s.currency) : "—"}</TableCell>
                      <TableCell className={`text-right font-mono ${s.difference ? (s.difference < 0 ? "text-destructive" : "text-orange-600") : ""}`}>
                        {s.difference != null ? `${s.difference > 0 ? "+" : ""}${money(s.difference, s.currency)}` : "—"}
                      </TableCell>
                      <TableCell><Badge variant={s.status === "open" ? "default" : "outline"}>{s.status === "open" ? "Ouverte" : "Fermée"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <OpenCashDialog open={openDialog} onOpenChange={setOpenDialog} site={site} currency={currency} />
      <CloseCashDialog open={closeDialog} onOpenChange={setCloseDialog} session={session} />
      <CashMovementDialog open={movement !== null} onOpenChange={(o) => !o && setMovement(null)} session={session} type={movement ?? "in"} />
    </div>
  );
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-mono ${strong ? "text-lg font-semibold" : ""}`}>{value}</div>
    </div>
  );
}
