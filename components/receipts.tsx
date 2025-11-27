"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Printer,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  RotateCcw,
} from "lucide-react";

type PaymentMethod = "carte" | "especes" | "mobile" | "cheque";
type ReceiptStatus = "complete" | "rembourse" | "annule";

interface ReceiptItem {
  nom: string;
  quantite: number;
  prixUnitaire: number;
}

interface ReceiptData {
  id: string;
  numero: string;
  date: string;
  heure: string;
  montant: number;
  methodePaiement: PaymentMethod;
  statut: ReceiptStatus;
  articles: ReceiptItem[];
  vendeur: string;
  tva: number;
}

const receiptsData: ReceiptData[] = [
  {
    id: "1",
    numero: "TK-2024-001542",
    date: "27/11/2024",
    heure: "14:32",
    montant: 45.8,
    methodePaiement: "carte",
    statut: "complete",
    articles: [
      { nom: "Café Espresso", quantite: 2, prixUnitaire: 2.5 },
      { nom: "Sandwich Club", quantite: 1, prixUnitaire: 8.9 },
      { nom: "Croissant", quantite: 3, prixUnitaire: 1.5 },
      { nom: "Jus d'Orange", quantite: 2, prixUnitaire: 3.0 },
      { nom: "Salade César", quantite: 1, prixUnitaire: 12.9 },
    ],
    vendeur: "Marie D.",
    tva: 7.63,
  },
  {
    id: "2",
    numero: "TK-2024-001541",
    date: "27/11/2024",
    heure: "13:45",
    montant: 28.5,
    methodePaiement: "especes",
    statut: "complete",
    articles: [
      { nom: "Menu Midi", quantite: 2, prixUnitaire: 12.5 },
      { nom: "Eau minérale", quantite: 2, prixUnitaire: 1.75 },
    ],
    vendeur: "Pierre L.",
    tva: 4.75,
  },
  {
    id: "3",
    numero: "TK-2024-001540",
    date: "27/11/2024",
    heure: "12:20",
    montant: 15.9,
    methodePaiement: "mobile",
    statut: "rembourse",
    articles: [
      { nom: "Pizza Margherita", quantite: 1, prixUnitaire: 12.9 },
      { nom: "Soda", quantite: 1, prixUnitaire: 3.0 },
    ],
    vendeur: "Marie D.",
    tva: 2.65,
  },
  {
    id: "4",
    numero: "TK-2024-001539",
    date: "27/11/2024",
    heure: "11:15",
    montant: 67.2,
    methodePaiement: "carte",
    statut: "complete",
    articles: [
      { nom: "Plateau Petit-déjeuner", quantite: 2, prixUnitaire: 18.9 },
      { nom: "Cappuccino", quantite: 2, prixUnitaire: 4.2 },
      { nom: "Viennoiserie assortie", quantite: 1, prixUnitaire: 8.5 },
      { nom: "Jus de fruits frais", quantite: 2, prixUnitaire: 5.5 },
    ],
    vendeur: "Sophie M.",
    tva: 11.2,
  },
  {
    id: "5",
    numero: "TK-2024-001538",
    date: "26/11/2024",
    heure: "19:30",
    montant: 0.0,
    methodePaiement: "carte",
    statut: "annule",
    articles: [{ nom: "Menu Soirée", quantite: 1, prixUnitaire: 24.9 }],
    vendeur: "Pierre L.",
    tva: 0.0,
  },
  {
    id: "6",
    numero: "TK-2024-001537",
    date: "26/11/2024",
    heure: "18:45",
    montant: 92.4,
    methodePaiement: "cheque",
    statut: "complete",
    articles: [
      { nom: "Menu Famille", quantite: 1, prixUnitaire: 45.0 },
      { nom: "Dessert du jour", quantite: 4, prixUnitaire: 6.5 },
      { nom: "Boissons", quantite: 4, prixUnitaire: 4.1 },
    ],
    vendeur: "Marie D.",
    tva: 15.4,
  },
];

const paymentIcons: Record<
  PaymentMethod,
  React.ComponentType<{ className?: string }>
> = {
  carte: CreditCard,
  especes: Banknote,
  mobile: Smartphone,
  cheque: Receipt,
};

const paymentLabels: Record<PaymentMethod, string> = {
  carte: "Carte",
  especes: "Espèces",
  mobile: "Mobile",
  cheque: "Chèque",
};

const statusConfig: Record<
  ReceiptStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  complete: { label: "Complété", variant: "default" },
  rembourse: { label: "Remboursé", variant: "secondary" },
  annule: { label: "Annulé", variant: "destructive" },
};

export function ReceiptsContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const [paymentFilter, setPaymentFilter] = useState<string>("tous");
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(
    null
  );

  const filteredReceipts = receiptsData.filter((receipt) => {
    const matchesSearch = receipt.numero
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "tous" || receipt.statut === statusFilter;
    const matchesPayment =
      paymentFilter === "tous" || receipt.methodePaiement === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro de ticket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="complete">Complété</SelectItem>
                <SelectItem value="rembourse">Remboursé</SelectItem>
                <SelectItem value="annule">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les paiements</SelectItem>
                <SelectItem value="carte">Carte</SelectItem>
                <SelectItem value="especes">Espèces</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="cheque">Chèque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Receipts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Liste des tickets
            <Badge variant="outline" className="ml-2 font-normal">
              {filteredReceipts.length} résultat
              {filteredReceipts.length !== 1 ? "s" : ""}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceipts.map((receipt) => {
                const PaymentIcon = paymentIcons[receipt.methodePaiement];
                const status = statusConfig[receipt.statut];

                return (
                  <TableRow
                    key={receipt.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedReceipt(receipt)}
                  >
                    <TableCell className="font-mono font-medium">
                      {receipt.numero}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{receipt.date}</p>
                        <p className="text-muted-foreground text-xs">
                          {receipt.heure}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <PaymentIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{paymentLabels[receipt.methodePaiement]}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {receipt.montant.toFixed(2)} €
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredReceipts.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun ticket trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Detail Dialog */}
      <Dialog
        open={!!selectedReceipt}
        onOpenChange={(open) => !open && setSelectedReceipt(null)}
      >
        {selectedReceipt && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Ticket {selectedReceipt.numero}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex justify-between items-start text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Date & Heure</p>
                  <p className="font-medium">
                    {selectedReceipt.date} à {selectedReceipt.heure}
                  </p>
                </div>
                <Badge variant={statusConfig[selectedReceipt.statut].variant}>
                  {statusConfig[selectedReceipt.statut].label}
                </Badge>
              </div>

              {/* Items */}
              <div className="border rounded-lg divide-y">
                <div className="px-4 py-2 bg-muted/50">
                  <p className="text-sm font-medium">Articles</p>
                </div>
                {selectedReceipt.articles.map((article, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-medium">{article.nom}</p>
                      <p className="text-xs text-muted-foreground">
                        {article.quantite} x {article.prixUnitaire.toFixed(2)} €
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {(article.quantite * article.prixUnitaire).toFixed(2)} €
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total HT</span>
                  <span>
                    {(selectedReceipt.montant - selectedReceipt.tva).toFixed(2)}{" "}
                    €
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA (20%)</span>
                  <span>{selectedReceipt.tva.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total TTC</span>
                  <span>{selectedReceipt.montant.toFixed(2)} €</span>
                </div>
              </div>

              {/* Payment & Seller */}
              <div className="flex justify-between items-center text-sm pt-2 border-t">
                <div className="flex items-center gap-2">
                  {(() => {
                    const PaymentIcon =
                      paymentIcons[selectedReceipt.methodePaiement];
                    return (
                      <PaymentIcon className="h-4 w-4 text-muted-foreground" />
                    );
                  })()}
                  <span>{paymentLabels[selectedReceipt.methodePaiement]}</span>
                </div>
                <span className="text-muted-foreground">
                  Vendeur: {selectedReceipt.vendeur}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 bg-transparent"
                >
                  <Printer className="h-4 w-4" />
                  Imprimer
                </Button>
                {selectedReceipt.statut === "complete" && (
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 bg-transparent"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Rembourser
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
