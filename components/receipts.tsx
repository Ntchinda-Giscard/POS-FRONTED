"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Printer, Receipt, CreditCard, Banknote, Smartphone, Loader2, RefreshCw } from "lucide-react";
import { fetchPaymentDetail, searchPayments, type PaymentDetail, type PaymentRecord } from "@/lib/api";
import { money } from "@/components/cash-session";
import { printReceiptHtml } from "@/lib/receipt-print";
import useSiteInfoStore from "@/stores/site-info-store";
import useUserStore from "@/stores/user-store";

type Row = PaymentRecord & { customerName?: string | null; userCode?: string | null; site?: string | null };

const METHOD_LABELS: Record<string, string> = { cash: "Espèces", card: "Carte", digital: "Mobile money" };

function MethodIcon({ method }: { method: string }) {
  if (method === "card") return <CreditCard className="h-4 w-4" />;
  if (method === "digital") return <Smartphone className="h-4 w-4" />;
  return <Banknote className="h-4 w-4" />;
}

const today = () => new Date().toISOString().slice(0, 10);

export function ReceiptsContent({ site }: { site?: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("all");
  const [dateFrom, setDateFrom] = useState(today());
  const [dateTo, setDateTo] = useState(today());
  const [detail, setDetail] = useState<PaymentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const siteInfo = useSiteInfoStore((s) => s.info);
  const users = useUserStore((s) => s.currentUser);

  const load = async () => {
    setLoading(true);
    const response = await searchPayments({
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      method: method === "all" ? undefined : method,
      search: search || undefined,
      limit: 500,
    });
    setRows(response.success && response.data ? response.data.filter((r) => !site || !r.site || r.site === site) : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, method, site]);

  const openDetail = async (transactionId: string) => {
    setLoadingDetail(true);
    const response = await fetchPaymentDetail(transactionId);
    setLoadingDetail(false);
    if (response.success && response.data) setDetail(response.data);
  };

  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  const currency = rows.find((r) => r.currency)?.currency ?? siteInfo?.currency ?? undefined;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Reçus</div><div className="text-2xl font-bold">{rows.length}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Montant encaissé</div><div className="text-2xl font-bold font-mono">{money(total, currency)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Période</div><div className="text-lg font-medium">{dateFrom} → {dateTo}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Reçus</CardTitle>
          <CardDescription>Paiements enregistrés à la caisse. Cliquez sur un reçu pour le réimprimer.</CardDescription>
          <div className="flex flex-col md:flex-row gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="N° reçu, commande, client, référence, téléphone…" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} className="pl-9" />
            </div>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full md:w-[160px]" />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full md:w-[160px]" />
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-full md:w-[170px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les modes</SelectItem>
                <SelectItem value="cash">Espèces</SelectItem>
                <SelectItem value="card">Carte</SelectItem>
                <SelectItem value="digital">Mobile money</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Aucun reçu sur cette période.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reçu</TableHead><TableHead>Date</TableHead><TableHead>Commande</TableHead><TableHead>Client</TableHead>
                    <TableHead>Caissier</TableHead><TableHead>Mode</TableHead><TableHead>Détail</TableHead><TableHead className="text-right">Montant</TableHead><TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.transactionId} className="cursor-pointer" onClick={() => openDetail(r.transactionId)}>
                      <TableCell className="font-mono text-xs">{r.transactionId}</TableCell>
                      <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs">{r.orderId}</TableCell>
                      <TableCell>{r.customerName ?? r.customerCode ?? "—"}</TableCell>
                      <TableCell>{r.userCode ?? "—"}</TableCell>
                      <TableCell><Badge variant="outline" className="gap-1"><MethodIcon method={r.method} />{METHOD_LABELS[r.method] ?? r.method}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.method === "cash" && r.change != null && `Reçu ${money(r.amountTendered, r.currency)} · monnaie ${money(r.change, r.currency)}`}
                        {r.method === "card" && (r.reference ? `Réf. ${r.reference}` : "")}
                        {r.method === "digital" && `${r.provider ?? ""} ${r.phone ?? ""}${r.reference ? ` · ${r.reference}` : ""}`}
                      </TableCell>
                      <TableCell className="text-right font-mono">{money(r.amount, r.currency)}</TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDetail(r.transactionId); }}><Printer className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detail || loadingDetail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reçu {detail?.transactionId}</DialogTitle>
          </DialogHeader>
          {loadingDetail && <Loader2 className="h-5 w-5 animate-spin" />}
          {detail && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Date</span><div>{new Date(detail.createdAt).toLocaleString()}</div></div>
                <div><span className="text-muted-foreground">Commande</span><div className="font-mono">{detail.orderId}</div></div>
                <div><span className="text-muted-foreground">Client</span><div>{detail.customerName ?? detail.customerCode ?? "—"}</div></div>
                <div><span className="text-muted-foreground">Caissier</span><div>{detail.userCode ?? "—"}</div></div>
                <div><span className="text-muted-foreground">Mode</span><div>{METHOD_LABELS[detail.method] ?? detail.method}{detail.provider ? ` (${detail.provider})` : ""}</div></div>
                <div><span className="text-muted-foreground">Référence</span><div>{detail.reference ?? detail.phone ?? "—"}</div></div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Article</TableHead><TableHead className="text-right">Qté</TableHead><TableHead className="text-right">PU TTC</TableHead><TableHead className="text-right">Total</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {detail.lines.map((l) => (
                    <TableRow key={`${l.line}-${l.item_code}`}>
                      <TableCell><div>{l.description}</div><div className="text-xs text-muted-foreground font-mono">{l.item_code}{l.tax_code ? ` · ${l.tax_code}` : ""}{l.free ? " · gratuit" : ""}</div></TableCell>
                      <TableCell className="text-right">{l.quantity}</TableCell>
                      <TableCell className="text-right font-mono">{money(l.net_price_ttc, detail.currency)}</TableCell>
                      <TableCell className="text-right font-mono">{money(l.quantity * l.net_price_ttc, detail.currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="space-y-1 border-t pt-2">
                {detail.total_ht != null && <div className="flex justify-between"><span>Total HT</span><span className="font-mono">{money(detail.total_ht, detail.currency)}</span></div>}
                {detail.total_ht != null && detail.total_ttc != null && <div className="flex justify-between"><span>TVA</span><span className="font-mono">{money(detail.total_ttc - detail.total_ht, detail.currency)}</span></div>}
                <div className="flex justify-between font-semibold text-base"><span>Payé</span><span className="font-mono">{money(detail.amount, detail.currency)}</span></div>
                {detail.change != null && <div className="flex justify-between text-muted-foreground"><span>Reçu / monnaie</span><span className="font-mono">{money(detail.amountTendered, detail.currency)} / {money(detail.change, detail.currency)}</span></div>}
              </div>
              <Button className="w-full" onClick={() => printReceiptHtml(detail, siteInfo, users?.name)}>
                <Printer className="h-4 w-4 mr-2" /> Réimprimer le reçu
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
