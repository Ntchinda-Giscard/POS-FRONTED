import type { PaymentDetail, SiteInfo } from "@/lib/api";
import { getCurrencyByCode } from "@/lib/utils";

const METHOD_LABELS: Record<string, string> = { cash: "Espèces", card: "Carte bancaire", digital: "Mobile money" };

export type ReceiptModel = {
  receiptNumber: string;
  orderId: string;
  date: Date;
  cashierName?: string | null;
  cashierCode?: string | null;
  customerName?: string | null;
  customerCode?: string | null;
  currency?: string | null;
  lines: { description: string; item_code: string; quantity: number; unit_ttc: number; unit_ht?: number; tax_code?: string | null; free?: boolean }[];
  totalHt?: number | null;
  totalTtc: number;
  method: string;
  provider?: string | null;
  phone?: string | null;
  reference?: string | null;
  amountTendered?: number | null;
  change?: number | null;
  footer?: string | null;
};

const esc = (v: unknown) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function receiptFromPayment(detail: PaymentDetail, cashierName?: string | null): ReceiptModel {
  return {
    receiptNumber: detail.transactionId,
    orderId: detail.orderId,
    date: new Date(detail.createdAt),
    cashierName: cashierName ?? detail.userCode,
    cashierCode: detail.userCode,
    customerName: detail.customerName,
    customerCode: detail.customerCode,
    currency: detail.currency,
    lines: detail.lines.map((l) => ({
      description: l.description, item_code: l.item_code, quantity: l.quantity,
      unit_ttc: l.net_price_ttc, unit_ht: l.net_price_ht, tax_code: l.tax_code, free: l.free,
    })),
    totalHt: detail.total_ht,
    totalTtc: detail.amount,
    method: detail.method,
    provider: detail.provider,
    phone: detail.phone,
    reference: detail.reference,
    amountTendered: detail.amountTendered,
    change: detail.change,
  };
}

/** 80 mm ticket HTML with the store identity coming from Sage X3 (FACILITY / BPADDRESS / COMPANY). */
export function buildReceiptHtml(receipt: ReceiptModel, site: SiteInfo | null, footer?: string | null): string {
  const cur = receipt.currency ? getCurrencyByCode(receipt.currency)?.symbol ?? `${receipt.currency} ` : "";
  const fmt = (v: number | null | undefined) => `${cur}${(v ?? 0).toFixed(2)}`;
  const tax = receipt.totalHt != null ? receipt.totalTtc - receipt.totalHt : null;
  const address = site ? [...site.address_lines, [site.postal_code, site.city].filter(Boolean).join(" "), site.country_name ?? site.country].filter(Boolean) : [];

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Reçu ${esc(receipt.receiptNumber)}</title>
<style>
  @media print { @page { margin: 4mm; } .no-print { display: none; } }
  body { font-family: "Courier New", monospace; font-size: 12px; color: #000; margin: 0; padding: 8px; }
  .receipt { width: 72mm; margin: 0 auto; }
  .center { text-align: center; }
  .store { font-size: 15px; font-weight: bold; }
  .muted { color: #444; font-size: 11px; }
  .sep { border-top: 1px dashed #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 1px 0; vertical-align: top; }
  .r { text-align: right; white-space: nowrap; }
  .total { font-size: 14px; font-weight: bold; }
  .btn { margin: 12px 4px; padding: 8px 14px; font-size: 13px; cursor: pointer; }
</style></head>
<body>
<div class="receipt">
  <div class="center">
    <div class="store">${esc(site?.name ?? "Point de vente")}</div>
    ${site?.company_name && site.company_name !== site.name ? `<div>${esc(site.company_name)}</div>` : ""}
    ${address.map((l) => `<div class="muted">${esc(l)}</div>`).join("")}
    ${site?.phone ? `<div class="muted">Tél. ${esc(site.phone)}</div>` : ""}
    ${site?.vat_number ? `<div class="muted">N° TVA ${esc(site.vat_number)}</div>` : ""}
  </div>
  <div class="sep"></div>
  <table>
    <tr><td>Reçu</td><td class="r">${esc(receipt.receiptNumber)}</td></tr>
    <tr><td>Commande</td><td class="r">${esc(receipt.orderId)}</td></tr>
    <tr><td>Date</td><td class="r">${receipt.date.toLocaleDateString()} ${receipt.date.toLocaleTimeString()}</td></tr>
    <tr><td>Caissier</td><td class="r">${esc(receipt.cashierName ?? receipt.cashierCode ?? "")}</td></tr>
    ${receipt.customerName || receipt.customerCode ? `<tr><td>Client</td><td class="r">${esc(receipt.customerName ?? receipt.customerCode)}</td></tr>` : ""}
    ${site?.code ? `<tr><td>Site</td><td class="r">${esc(site.code)}</td></tr>` : ""}
  </table>
  <div class="sep"></div>
  <table>
    ${receipt.lines.map((l) => `
    <tr><td colspan="2">${esc(l.description)}${l.free ? " (gratuit)" : ""}</td></tr>
    <tr><td class="muted">${esc(l.item_code)} &nbsp; ${l.quantity} x ${fmt(l.unit_ttc)}${l.tax_code ? ` &nbsp; ${esc(l.tax_code)}` : ""}</td><td class="r">${fmt(l.quantity * l.unit_ttc)}</td></tr>`).join("")}
  </table>
  <div class="sep"></div>
  <table>
    ${receipt.totalHt != null ? `<tr><td>Total HT</td><td class="r">${fmt(receipt.totalHt)}</td></tr>` : ""}
    ${tax != null ? `<tr><td>TVA</td><td class="r">${fmt(tax)}</td></tr>` : ""}
    <tr class="total"><td>TOTAL TTC</td><td class="r">${fmt(receipt.totalTtc)}</td></tr>
    <tr><td>${esc(METHOD_LABELS[receipt.method] ?? receipt.method)}${receipt.provider ? ` ${esc(receipt.provider)}` : ""}</td><td class="r">${fmt(receipt.totalTtc)}</td></tr>
    ${receipt.amountTendered != null ? `<tr><td>Reçu</td><td class="r">${fmt(receipt.amountTendered)}</td></tr>` : ""}
    ${receipt.change != null ? `<tr><td>Monnaie rendue</td><td class="r">${fmt(receipt.change)}</td></tr>` : ""}
    ${receipt.reference ? `<tr><td>Référence</td><td class="r">${esc(receipt.reference)}</td></tr>` : ""}
    ${receipt.phone ? `<tr><td>Téléphone</td><td class="r">${esc(receipt.phone)}</td></tr>` : ""}
  </table>
  <div class="sep"></div>
  <div class="center muted">${esc(footer ?? "Merci de votre visite")}</div>
  <div class="center no-print">
    <button class="btn" onclick="window.print()">Imprimer</button>
    <button class="btn" onclick="window.close()">Fermer</button>
  </div>
</div>
<script>window.addEventListener("load", function () { setTimeout(function () { window.print(); }, 300); });</script>
</body></html>`;
}

export function openReceiptWindow(html: string) {
  const win = window.open("", "_blank", "width=420,height=720");
  if (!win) return false;
  win.document.write(html);
  win.document.close();
  return true;
}

export function printReceiptHtml(detail: PaymentDetail, site: SiteInfo | null, cashierName?: string | null, footer?: string | null) {
  return openReceiptWindow(buildReceiptHtml(receiptFromPayment(detail, cashierName), site, footer));
}
