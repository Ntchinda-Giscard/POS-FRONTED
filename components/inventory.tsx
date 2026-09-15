"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Package, Loader2, AlertTriangle, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { fetchStock, type StockItem } from "@/lib/api";

const STATUS: Record<StockItem["status"], { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  out: { label: "Rupture", variant: "destructive" },
  low: { label: "Stock bas", variant: "secondary" },
  ok: { label: "OK", variant: "default" },
  over: { label: "Surstock", variant: "outline" },
};

export function InventoryContent({ site }: { site: string }) {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | StockItem["status"]>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    if (!site) return;
    setLoading(true);
    const response = await fetchStock(site, true);
    setItems(response.success && response.data ? response.data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);

  const counts = useMemo(() => ({
    out: items.filter((i) => i.status === "out").length,
    low: items.filter((i) => i.status === "low").length,
    over: items.filter((i) => i.status === "over").length,
  }), [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) =>
      (filter === "all" || i.status === filter) &&
      (!q || i.item_code.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || (i.barcode ?? "").includes(q))
    );
  }, [items, search, filter]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Articles sur le site</div><div className="text-2xl font-bold">{items.length}</div></CardContent></Card>
        <Card className={counts.out ? "border-destructive/50" : ""}><CardContent className="p-4"><div className="text-xs text-muted-foreground">Ruptures</div><div className="text-2xl font-bold text-destructive">{counts.out}</div></CardContent></Card>
        <Card className={counts.low ? "border-orange-400/50" : ""}><CardContent className="p-4"><div className="text-xs text-muted-foreground">Stock bas (≤ stock de sécurité)</div><div className="text-2xl font-bold text-orange-600">{counts.low}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Surstock (&gt; stock maxi)</div><div className="text-2xl font-bold">{counts.over}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Inventaire {site}</CardTitle>
          <CardDescription>Quantités de la table STOCK Sage X3, seuils de l'article-site (ITMFACILIT). Mis à jour à chaque synchronisation.</CardDescription>
          <div className="flex flex-col md:flex-row gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Code, désignation, code-barres…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-1 flex-wrap">
              {(["all", "out", "low", "ok", "over"] as const).map((f) => (
                <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
                  {f === "all" ? "Tous" : STATUS[f].label}
                </Button>
              ))}
              <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" /><TableHead>Article</TableHead><TableHead>Code-barres</TableHead><TableHead>Unité</TableHead>
                    <TableHead className="text-right">Physique</TableHead><TableHead className="text-right">Alloué</TableHead><TableHead className="text-right">Disponible</TableHead>
                    <TableHead className="text-right">Sécurité</TableHead><TableHead className="text-right">Maxi</TableHead><TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((i) => (
                    <>
                      <TableRow key={i.item_code} className="cursor-pointer" onClick={() => setExpanded(expanded === i.item_code ? null : i.item_code)}>
                        <TableCell>{i.lots.length > 0 ? (expanded === i.item_code ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : null}</TableCell>
                        <TableCell><div className="font-medium">{i.description}</div><div className="text-xs text-muted-foreground font-mono">{i.item_code}{i.category ? ` · ${i.category}` : ""}</div></TableCell>
                        <TableCell className="font-mono text-xs">{i.barcode ?? "—"}</TableCell>
                        <TableCell>{i.unit ?? "—"}</TableCell>
                        <TableCell className="text-right font-mono">{i.quantity}</TableCell>
                        <TableCell className="text-right font-mono">{i.allocated}</TableCell>
                        <TableCell className="text-right font-mono font-semibold">{i.available}</TableCell>
                        <TableCell className="text-right font-mono">{i.safety_stock || "—"}</TableCell>
                        <TableCell className="text-right font-mono">{i.max_stock || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS[i.status].variant} className="gap-1">
                            {(i.status === "out" || i.status === "low") && <AlertTriangle className="h-3 w-3" />}{STATUS[i.status].label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      {expanded === i.item_code && i.lots.length > 0 && (
                        <TableRow key={`${i.item_code}-lots`} className="bg-muted/40">
                          <TableCell />
                          <TableCell colSpan={9}>
                            <div className="text-xs font-medium mb-1">Lots / emplacements</div>
                            <table className="text-xs w-full">
                              <thead><tr className="text-muted-foreground"><th className="text-left font-normal">Lot</th><th className="text-left font-normal">Emplacement</th><th className="text-left font-normal">Statut</th><th className="text-left font-normal">Réception</th><th className="text-right font-normal">Qté</th><th className="text-right font-normal">Allouée</th></tr></thead>
                              <tbody>
                                {i.lots.map((l, idx) => (
                                  <tr key={idx}><td>{l.lot ?? "—"}</td><td>{l.location ?? "—"}</td><td>{l.status ?? "—"}</td><td>{l.received_at ?? "—"}</td><td className="text-right font-mono">{l.quantity}</td><td className="text-right font-mono">{l.allocated}</td></tr>
                                ))}
                              </tbody>
                            </table>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                  {filtered.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">Aucun article.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
