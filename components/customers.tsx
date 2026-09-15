"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, Loader2, MapPin, Phone, Mail, UserRound, ShoppingBag } from "lucide-react";
import { fetchClientDetail, fetchClientOrders, fetchClients, type ClientDetail, type ClientOrder } from "@/lib/api";
import { money } from "@/components/cash-session";
import useClientStore from "@/stores/client-store";

type ClientRow = { code: string; name: string; cur: string; mode_fac: string };

export function CustomersContent({ onSelectForSale }: { onSelectForSale?: (code: string) => void }) {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const setSelectedClientCode = useClientStore((s) => s.setSelectedClientCode);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const response = await fetchClients();
      setClients(response?.data ?? []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      setLoadingDetail(true);
      const [d, o] = await Promise.all([fetchClientDetail(selected), fetchClientOrders(selected)]);
      setDetail(d.success && d.data ? d.data : null);
      setOrders(o.success && o.data ? o.data : []);
      setLoadingDetail(false);
    })();
  }, [selected]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  }, [clients, search]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Clients</CardTitle>
          <CardDescription>{clients.length} clients Sage X3 (BPCUSTOMER)</CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Code ou nom…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="max-h-[70vh] overflow-y-auto p-0">
          {loading ? (
            <div className="p-6"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : (
            <ul className="divide-y">
              {filtered.map((c) => (
                <li key={c.code}>
                  <button
                    className={`w-full text-left px-4 py-3 hover:bg-muted/60 transition-colors ${selected === c.code ? "bg-muted" : ""}`}
                    onClick={() => setSelected(c.code)}
                  >
                    <div className="font-medium truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{c.code} · {c.cur}</div>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && <li className="p-6 text-sm text-muted-foreground">Aucun client.</li>}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="xl:col-span-3 space-y-6">
        {!selected && (
          <Card><CardContent className="p-10 text-center text-muted-foreground"><UserRound className="h-10 w-10 mx-auto mb-3" />Sélectionnez un client pour voir sa fiche et son historique.</CardContent></Card>
        )}
        {selected && loadingDetail && <Loader2 className="h-6 w-6 animate-spin" />}
        {detail && !loadingDetail && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>{detail.name}</CardTitle>
                  <CardDescription className="font-mono">{detail.code}{detail.short_name ? ` · ${detail.short_name}` : ""}</CardDescription>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant={detail.is_active ? "default" : "destructive"}>{detail.is_active ? "Actif" : "Inactif"}</Badge>
                  {detail.category && <Badge variant="outline">Catégorie {detail.category}</Badge>}
                  {onSelectForSale && (
                    <Button size="sm" onClick={() => { setSelectedClientCode(detail.code); onSelectForSale(detail.code); }}>
                      <ShoppingBag className="h-4 w-4 mr-1" /> Vendre
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium">Coordonnées</h4>
                  {detail.contact && <div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-muted-foreground" />{detail.contact}</div>}
                  {(detail.address_lines.length > 0 || detail.city) && (
                    <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>{detail.address_lines.map((l) => <div key={l}>{l}</div>)}<div>{[detail.postal_code, detail.city, detail.country].filter(Boolean).join(" ")}</div></div>
                    </div>
                  )}
                  {(detail.phone || detail.mobile) && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{[detail.phone, detail.mobile].filter(Boolean).join(" / ")}</div>}
                  {detail.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{detail.email}</div>}
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">Conditions</h4>
                  <Row label="Devise" value={detail.currency} />
                  <Row label="Condition de paiement" value={detail.payment_term_label ? `${detail.payment_term_label} (${detail.payment_term})` : detail.payment_term} />
                  <Row label="Régime de taxe" value={detail.tax_rule} />
                  <Row label="Type de prix" value={detail.price_type} />
                  <Row label="Encours autorisé" value={detail.credit_limit ? money(detail.credit_limit, detail.currency) : "—"} />
                  <Row label="Client facturé / payeur" value={`${detail.invoice_customer ?? "—"} / ${detail.payer ?? "—"}`} />
                </div>
                <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat label="Commandes" value={`${detail.orders_count}`} />
                  <Stat label="Total commandé TTC" value={money(detail.orders_total_ttc, detail.currency)} />
                  <Stat label="Paiements caisse" value={`${detail.payments_count}`} />
                  <Stat label="Encaissé à la caisse" value={money(detail.payments_total, detail.currency)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historique d'achats</CardTitle>
                <CardDescription>Commandes Sage X3 et ventes enregistrées à la caisse</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? <p className="text-sm text-muted-foreground">Aucune commande.</p> : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow><TableHead>Commande</TableHead><TableHead>Date</TableHead><TableHead>Site</TableHead><TableHead>Lignes</TableHead><TableHead className="text-right">HT</TableHead><TableHead className="text-right">TTC</TableHead><TableHead className="text-right">Payé caisse</TableHead><TableHead>Origine</TableHead></TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((o) => (
                          <TableRow key={o.order_id}>
                            <TableCell className="font-mono text-xs">{o.order_id}</TableCell>
                            <TableCell>{o.date ?? "—"}</TableCell>
                            <TableCell>{o.site}</TableCell>
                            <TableCell>{o.lines}</TableCell>
                            <TableCell className="text-right font-mono">{money(o.total_ht, o.currency)}</TableCell>
                            <TableCell className="text-right font-mono">{money(o.total_ttc, o.currency)}</TableCell>
                            <TableCell className="text-right font-mono">{o.paid ? `${money(o.paid, o.currency)} (${o.payment_methods.join(", ")})` : "—"}</TableCell>
                            <TableCell><Badge variant={o.source === "pos" ? "default" : "outline"}>{o.source === "pos" ? "Caisse" : "X3"}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return <div className="flex justify-between gap-4"><span className="text-muted-foreground">{label}</span><span className="text-right">{value || "—"}</span></div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="font-mono font-semibold">{value}</div></div>;
}
