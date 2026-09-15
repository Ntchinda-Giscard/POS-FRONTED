"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  CreditCard,
  Loader2,
  Package,
  Wallet,
  Database,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { fetchReportSummary, reportExportUrl, type ReportPeriod, type ReportSummary } from "@/lib/api";
import { money } from "@/components/cash-session";

const PERIODS: { value: ReportPeriod | "custom"; label: string }[] = [
  { value: "today", label: "Aujourd'hui" },
  { value: "yesterday", label: "Hier" },
  { value: "week", label: "Cette semaine" },
  { value: "last7", label: "7 derniers jours" },
  { value: "month", label: "Ce mois" },
  { value: "last30", label: "30 derniers jours" },
  { value: "year", label: "Cette année" },
  { value: "custom", label: "Personnalisée" },
];

export function ReportsContent({ site, currency }: { site?: string; currency?: string }) {
  const [periode, setPeriode] = useState<ReportPeriod | "custom">("week");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [data, setData] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = periode === "custom"
    ? { date_from: dateFrom, date_to: dateTo, site }
    : { period: periode, site };

  const load = async () => {
    if (periode === "custom" && (!dateFrom || !dateTo)) return;
    setLoading(true);
    setError(null);
    const response = await fetchReportSummary(query);
    if (response.success && response.data) setData(response.data);
    else setError(response.error ?? "Erreur");
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periode, dateFrom, dateTo, site]);

  const cur = data?.currency ?? currency;
  const kpi = data?.kpi;
  const change = kpi?.revenue_change_pct ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <Select value={periode} onValueChange={(v) => setPeriode(v as ReportPeriod | "custom")}>
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder="Sélectionner période" />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {periode === "custom" && (
            <>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[160px]" />
              <span className="text-muted-foreground">→</span>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[160px]" />
            </>
          )}
          {data && (
            <span className="text-sm text-muted-foreground">
              {data.date_from} → {data.date_to}{site ? ` · site ${site}` : ""}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open(reportExportUrl("payments", query), "_blank")} disabled={!data}>
            <Download className="h-4 w-4 mr-2" /> Paiements (CSV)
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open(reportExportUrl("sales-lines", query), "_blank")} disabled={!data}>
            <Download className="h-4 w-4 mr-2" /> Lignes de vente (CSV)
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading && !data && <Loader2 className="h-6 w-6 animate-spin" />}

      {kpi && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Chiffre d'affaires (encaissé)"
              value={money(kpi.revenue, cur)}
              icon={<Wallet className="h-4 w-4" />}
              hint={
                change !== null ? (
                  <span className={`flex items-center gap-1 ${change >= 0 ? "text-green-600" : "text-destructive"}`}>
                    {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {change >= 0 ? "+" : ""}{change}% vs période précédente ({money(kpi.previous_revenue, cur)})
                  </span>
                ) : (
                  `Période précédente : ${money(kpi.previous_revenue, cur)}`
                )
              }
            />
            <KpiCard title="Transactions" value={`${kpi.transactions}`} icon={<ShoppingCart className="h-4 w-4" />} hint={`${kpi.items_sold} articles vendus`} />
            <KpiCard title="Panier moyen" value={money(kpi.average_basket, cur)} icon={<Users className="h-4 w-4" />} hint={`HT ${money(kpi.orders_revenue_ht, cur)} · TVA ${money(kpi.tax_total, cur)}`} />
            <KpiCard
              title="Par mode de paiement"
              value={money(kpi.cash_total, cur)}
              icon={<CreditCard className="h-4 w-4" />}
              hint={`espèces · carte ${money(kpi.card_total, cur)} · mobile ${money(kpi.digital_total, cur)}`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ventes par jour</CardTitle>
                <CardDescription>Montants encaissés à la caisse</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={data!.by_day}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(v: number) => money(v, cur)} />
                    <Area type="monotone" dataKey="revenue" name="CA" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Modes de paiement</CardTitle>
                <CardDescription>Répartition des encaissements</CardDescription>
              </CardHeader>
              <CardContent>
                {data!.by_method.length === 0 ? (
                  <Empty />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data!.by_method}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="label" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip formatter={(v: number) => money(v, cur)} />
                      <Bar dataKey="total" name="Montant" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Package className="h-4 w-4" /> Meilleures ventes</CardTitle>
                <CardDescription>Articles des commandes encaissées</CardDescription>
              </CardHeader>
              <CardContent>
                {data!.top_products.length === 0 ? <Empty /> : (
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead>Article</TableHead><TableHead className="text-right">Qté</TableHead><TableHead className="text-right">HT</TableHead><TableHead className="text-right">TTC</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {data!.top_products.map((p) => (
                        <TableRow key={p.item_code}>
                          <TableCell><div className="font-medium">{p.description}</div><div className="text-xs text-muted-foreground font-mono">{p.item_code}</div></TableCell>
                          <TableCell className="text-right">{p.quantity}</TableCell>
                          <TableCell className="text-right font-mono">{money(p.revenue_ht, cur)}</TableCell>
                          <TableCell className="text-right font-mono">{money(p.revenue_ttc, cur)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> Ventes par caissier</CardTitle>
                <CardDescription>
                  {data!.cash_sessions} session(s) de caisse · écart cumulé {money(data!.cash_difference_total, cur)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data!.by_user.length === 0 ? <Empty /> : (
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead>Caissier</TableHead><TableHead className="text-right">Transactions</TableHead><TableHead className="text-right">Montant</TableHead><TableHead className="text-right">Panier moyen</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {data!.by_user.map((u) => (
                        <TableRow key={u.user_code}>
                          <TableCell><div className="font-medium">{u.name ?? u.user_code}</div><div className="text-xs text-muted-foreground font-mono">{u.user_code}</div></TableCell>
                          <TableCell className="text-right">{u.transactions}</TableCell>
                          <TableCell className="text-right font-mono">{money(u.revenue, cur)}</TableCell>
                          <TableCell className="text-right font-mono">{money(u.transactions ? u.revenue / u.transactions : 0, cur)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {data!.by_hour.some((h) => h.transactions > 0) && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Affluence par heure</h4>
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={data!.by_hour.filter((h) => h.hour >= 6 && h.hour <= 22)}>
                        <XAxis dataKey="hour" fontSize={11} tickFormatter={(h) => `${h}h`} />
                        <Tooltip formatter={(v: number, name) => (name === "revenue" ? money(v, cur) : v)} labelFormatter={(h) => `${h}h`} />
                        <Bar dataKey="transactions" name="Transactions" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Database className="h-4 w-4" /> Historique Sage X3 du site</CardTitle>
              <CardDescription>
                Commandes déjà présentes dans Sage X3 : {data!.x3.orders} commandes, {money(data!.x3.revenue_ttc, cur)} TTC
                {data!.x3.first_date && ` (${data!.x3.first_date} → ${data!.x3.last_date})`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data!.x3.orders === 0 ? <Empty text="Aucune commande X3 pour ce site." /> : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={data!.x3.by_month}>
                        <XAxis dataKey="label" fontSize={11} />
                        <Tooltip formatter={(v: number) => money(v, cur)} />
                        <Bar dataKey="revenue" name="CA TTC" fill="hsl(var(--muted-foreground))" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Articles les plus commandés</h4>
                    <ul className="text-sm space-y-1">
                      {data!.x3.top_products.slice(0, 6).map((p) => (
                        <li key={p.item_code} className="flex justify-between gap-2">
                          <span className="truncate">{p.description} <span className="text-muted-foreground font-mono text-xs">{p.item_code}</span></span>
                          <span className="font-mono whitespace-nowrap">{p.quantity} · {money(p.revenue_ttc, cur)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Meilleurs clients</h4>
                    <ul className="text-sm space-y-1">
                      {data!.x3.top_customers.slice(0, 6).map((c) => (
                        <li key={c.user_code} className="flex justify-between gap-2">
                          <span className="truncate">{c.name || c.user_code} <Badge variant="outline" className="ml-1 font-mono text-[10px]">{c.user_code}</Badge></span>
                          <span className="font-mono whitespace-nowrap">{c.transactions} · {money(c.revenue, cur)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function KpiCard({ title, value, icon, hint }: { title: string; value: string; icon: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono">{value}</div>
        {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function Empty({ text = "Aucune donnée sur la période." }: { text?: string }) {
  return <p className="text-sm text-muted-foreground py-6 text-center">{text}</p>;
}
