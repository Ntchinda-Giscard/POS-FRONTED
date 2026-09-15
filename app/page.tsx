"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Search,
  CreditCard,
  DollarSign,
  Package,
  AlertTriangle,
  Smartphone,
  Sparkles,
  Moon,
  Sun,
  X,
  Loader2,
  Minus,
  Plus,
  Menu,
  Trash2,
  TrendingUp,
  Calculator,
  Repeat,
  Folder,
  Loader,
} from "lucide-react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import HeaderCommande from "@/components/header-commande";
import GestionCommande from "@/components/gestion";
import Livraison from "@/components/livraison";
import Facturation from "@/components/facturation";
import SiteExpedition from "@/components/select-site-epedition";
import useSiteExpeditionStore from "@/stores/expedition-store";
import {
  createSalseOrder,
  fetchAppliedTaxes,
  fetchArticleByBarcode,
  fetchCommandCurrency,
  fetchElementFacturation,
  fetchPayments,
  fetchPricing,
  fetchProducts,
  fetchTaxRegimes,
  fetchTiers,
  PaymentRecord,
  PricingRequest,
  processPayment,
  synchronizeData,
  Tax,
} from "@/lib/api";
import { LoginScreen } from "@/components/login-screen";
import { CashSessionView, CloseCashDialog, OpenCashDialog } from "@/components/cash-session";
import { CustomersContent } from "@/components/customers";
import { InventoryContent } from "@/components/inventory";
import useUserStore from "@/stores/user-store";
import useCashSessionStore from "@/stores/cash-session-store";
import useSiteInfoStore from "@/stores/site-info-store";
import useCommandTypeStore from "@/stores/command-type-store";
import {
  CartItem,
  Customer,
  Product,
  SalesOrder,
  Transaction,
} from "@/types/pos";
import useClientStore from "@/stores/client-store";
import useTaxeStore from "@/stores/taxe-store";
import useCurrencyStore from "@/stores/currency-store";
import { getCurrencyByCode } from "@/lib/utils";
import useElementFactStore from "@/stores/element-fact";
import { TransactionConfirmation } from "@/components/transaction-confirmation";
import { ReceiptGenerator } from "@/components/receipt-generator";
import { Sidebar } from "@/components/sidebar";
import {
  EnhancedReceiptGenerator,
  EnhancedTransactionConfirmation,
} from "@/components/new-reciept-generator";
import useSiteVenteStore from "@/stores/site-store";
import useTierStore from "@/stores/tier-store";
import SwirlingEffectSpinner from "@/components/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { ReportsContent } from "@/components/reports";
import { SettingsForm } from "@/components/settings";
import { ReceiptsContent } from "@/components/receipts";
import Livraison2 from "@/components/livraison2";
import { ProductImage } from "@/components/product-image";


const tabs = [
  {
    name: "En-tête",
    value: "header",
    content: <HeaderCommande />,
  },
  {
    name: "Gestion",
    value: "gestion",
    content: <GestionCommande />,
  },
  {
    name: "Livraison",
    value: "livraison",
    content: <Livraison />,
  },
  {
    name: "Facturation",
    value: "facturation",
    content: <Facturation />,
  },
];

// A payment registered at the till, as shown in the history list and the sidebar summary.
type HistoryEntry = {
  id: string;
  orderId: string;
  timestamp: Date;
  total: number;
  paymentMethod: "cash" | "card" | "digital";
  reference?: string | null;
  provider?: string | null;
  phone?: string | null;
  change?: number | null;
  currency?: string | null;
};

const toHistoryEntry = (payment: PaymentRecord): HistoryEntry => ({
  id: payment.transactionId,
  orderId: payment.orderId,
  timestamp: new Date(payment.createdAt),
  total: payment.amount,
  paymentMethod: payment.method,
  reference: payment.reference,
  provider: payment.provider,
  phone: payment.phone,
  change: payment.change,
  currency: payment.currency,
});

const todayIso = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function POSApp() {
  useEffect(() => {
    const handleSync = async () => {
      await synchronizeData();
    };
    handleSync();
  }, []);
  const selectedClientCode = useClientStore(
    (state) => state.selectedClientCode
  );
  const {
    selectedElementFact,
    selectedElementFactCode,
    elementFacts,
    setSelectedElementFact,
    setSelectedElementFactCode,
    setElementFacts,
  } = useElementFactStore();

  const { selectedSitetCode, sites, setSelectedSitetCode, setSiteVente } =
    useSiteVenteStore();

  const [currentView, setCurrentView] = useState("pos");
  const [completedTransaction, setCompletedTransaction] =
    useState<Transaction | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<HistoryEntry[]>([]);
  // Order already written to SORDER for the current cart; set when the order was
  // created but the payment failed to register, so a retry doesn't duplicate it.
  const pendingOrderRef = useRef<string | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showReceiptGenerator, setShowReceiptGenerator] = useState(false);
  const [folderPath, setFolderPath] = useState("");

  const [productQuantities, setProductQuantities] = useState<
    Record<string, number>
  >({});
  const [showQuantityControls, setShowQuantityControls] = useState<
    Record<string, boolean>
  >({});
  const [openCashDialog, setOpenCashDialog] = useState(false);
  const [closeCashDialog, setCloseCashDialog] = useState(false);
  const currentUser = useUserStore((s) => s.currentUser);
  const cashSession = useCashSessionStore((s) => s.session);
  const refreshCashSession = useCashSessionStore((s) => s.refresh);
  const siteInfo = useSiteInfoStore((s) => s.info);
  const loadSiteInfo = useSiteInfoStore((s) => s.load);
  const selectedCommandType = useCommandTypeStore((s) => s.selectedTypeCode);
  const [paymentMethodForm, setPaymentMethodForm] = useState<"none" | "cash" | "card" | "digital">("none");
  const [digitalPhone, setDigitalPhone] = useState<string>("");
  const [digitalProvider, setDigitalProvider] = useState<string>("MOMO");
  const [cardReference, setCardReference] = useState<string>("");
  const [cashReceived, setCashReceived] = useState<string>("");

  const { theme, setTheme } = useTheme();
  const siteExoeditionCode = useSiteExpeditionStore(
    (state) => state.selectedadressExpeditionCode
  );

  const { selectTaxeCode, setTaxeCode } = useTaxeStore();
  const { selectedCurrencyCode, setCurrency } = useCurrencyStore();
  const { selectTierCode, setTierCode } = useTierStore();

  useEffect(() => {
    if (!selectedClientCode) return; // nothing selected yet (e.g. login screen)
    const loadingClients = async () => {
      try {
        const response = await fetchTiers(selectedClientCode);
        console.log("Fetched tiers:", response);
        setTierCode(response?.data.code || "");
        if (response && response.success) {
          console.log("Clients loaded:", response.data);
        }
      } catch (error) {
        console.error("Error loading clients:", error);
      }
    };
    loadingClients();
  }, [setTierCode, selectedClientCode]);

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.categorie))),
  ];

  const filteredProducts = products?.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product?.categorie === selectedCategory;
    const matchesSearch =
      product?.describtion?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      product?.item_code?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      (product?.barcode ?? "").includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        variant: "destructive" as const,
        color: "text-destructive",
      };
    if (stock <= 10)
      return {
        label: "Low Stock",
        variant: "secondary" as const,
        color: "text-orange-600",
      };
    return {
      label: "In Stock",
      variant: "default" as const,
      color: "text-green-600",
    };
  };

  // Ask the backend for X3 prices (tariffs, discounts, free items) and X3 taxes for the whole cart,
  // then fold the answer into the cart lines.
  const applyPricing = async (updatedCart: CartItem[]) => {
    if (updatedCart.length === 0) return;
    const mappedRequests: PricingRequest[] = updatedCart.map((item: CartItem) => ({
      item_code: item.item_code,
      quantity: item.quantity.toString(),
      customer_code: item.customer_code,
      currency: selectedCurrencyCode,
      unit_of_measure: item.product.unit_sales ?? "",
    }));
    const mappedTaxRequests = updatedCart.map((item: CartItem) => ({
      item_code: item.item_code,
      regime_taxe_tiers: selectTaxeCode,
      site: selectedSitetCode,
    }));
    try {
      const [pricingResponse, taxResponse] = await Promise.all([
        fetchPricing(mappedRequests),
        fetchAppliedTaxes(mappedTaxRequests),
      ]);
      const warnings = (taxResponse.data ?? []).filter((t: Tax) => t.warning);
      if (warnings.length > 0) {
        console.warn("[taxe]", warnings);
      }
      setCart((prevCart) =>
        prevCart.map((cartItem) => {
          const pricingData = pricingResponse.data?.find(
            (priceItem: any) => priceItem.item_code === cartItem.item_code
          );
          const taxData = taxResponse.data?.find(
            (taxItem: Tax) => taxItem.item_code === cartItem.item_code
          );
          const taxFactor = taxData ? 1 + (taxData.taux ?? 0) / 100 : 1;
          const taxFields = taxData
            ? { tax_code: taxData.code_taxe, tax_rate: taxData.taux, tax_warning: taxData.warning ?? null }
            : {};

          if (pricingData) {
            const backendUnitPrice = pricingData.prix_net;
            const backendTotalPrice = pricingData.total_HT;
            const backendGrossPrice = pricingData.prix_brut;
            const hasValidBackendPricing =
              (backendUnitPrice && backendUnitPrice > 0) ||
              (backendTotalPrice && backendTotalPrice > 0) ||
              (backendGrossPrice && backendGrossPrice > 0);
            const finalUnitPrice =
              hasValidBackendPricing && backendUnitPrice > 0
                ? backendUnitPrice
                : cartItem.product.base_price;
            const finalTotalPrice =
              hasValidBackendPricing && backendTotalPrice > 0
                ? backendTotalPrice
                : finalUnitPrice * cartItem.quantity;
            return {
              ...cartItem,
              ...taxFields,
              unitpriceHT: finalUnitPrice,
              unitPriceTTC: finalUnitPrice * taxFactor,
              totalPrice: finalTotalPrice * taxFactor,
              totalpriceHT: finalTotalPrice,
              free_items: pricingData.gratuit,
            };
          }
          // no tariff line: base price + tax
          return {
            ...cartItem,
            ...taxFields,
            unitPriceTTC: cartItem.unitpriceHT * taxFactor,
            totalPrice: cartItem.totalpriceHT * taxFactor,
          };
        })
      );
    } catch (error) {
      console.error("Error fetching pricing:", error);
    }
  };

  const addToCart = (product: Product) => {
    const quantity = productQuantities[product.item_code] || 1;

    const button = document.querySelector(
      `[data-product-id="${product.item_code}"]`
    );
    if (button) {
      button.classList.add("animate-bounce");
      setTimeout(() => button.classList.remove("animate-bounce"), 600);
    }

    setShowQuantityControls((prev) => ({
      ...prev,
      [product.item_code]: true,
    }));

    const existingItem = cart.find((item) => item.item_code === product.item_code);
    const newCart: CartItem[] = existingItem
      ? cart.map((item) =>
          item.item_code === product.item_code
            ? {
                ...item,
                customer_code: selectedClientCode,
                quantity: item.quantity + quantity,
                totalPrice: (item.quantity + quantity) * item.unitPriceTTC,
                totalpriceHT: (item.quantity + quantity) * item.unitpriceHT,
              }
            : item
        )
      : [
          ...cart,
          {
            customer_code: selectedClientCode,
            item_code: product.item_code,
            product,
            quantity,
            unitPriceTTC: product.base_price, // refined by applyPricing
            unitpriceHT: product.base_price,
            totalPrice: product.base_price * quantity,
            totalpriceHT: product.base_price * quantity,
          },
        ];
    setCart(newCart);
    applyPricing(newCart);
  };

  // Scanner input: the search box receives the barcode followed by Enter.
  const handleScan = async (code: string) => {
    const value = code.trim();
    if (!value) return;
    const local = products.find(
      (p) => p.barcode === value || p.item_code.toUpperCase() === value.toUpperCase()
    );
    let product: Product | undefined = local;
    if (!product && siteExoeditionCode) {
      const response = await fetchArticleByBarcode(siteExoeditionCode, value);
      if (response.success && response.data) product = response.data;
    }
    if (!product) {
      toast.error(`Aucun article pour le code ${value}`);
      return;
    }
    addToCart(product);
    setSearchTerm("");
    toast.success(`${product.describtion} ajouté au panier`);
  };

  const removeFromCart = (item_code: string) => {
    setCart((prev) => prev.filter((item) => item.item_code !== item_code));
  };

  const updateQuantity = async (item_code: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(item_code);
      return;
    }

    // First, update the cart with the new quantity
    const updatedCart = cart.map((item) =>
      item.item_code === item_code
        ? {
            ...item,
            customer_code: selectedClientCode,
            quantity,
            // Keep the existing unitPrice for now, will be updated with API response
            totalPrice: quantity * item.unitpriceHT,
          }
        : item
    );

    // Update the cart state with new quantity
    setCart(updatedCart);
    await applyPricing(updatedCart);
  };

  const updateProductQuantity = async (item_code: string, quantity: number) => {
    // Check if item is already in cart
    const existingCartItem = cart.find((item) => item.item_code === item_code);

    if (quantity <= 0) {
      // Remove from product quantities
      setProductQuantities((prev) => {
        const newQuantities = { ...prev };
        delete newQuantities[item_code];
        return newQuantities;
      });

      // Hide quantity controls
      setShowQuantityControls((prev) => ({
        ...prev,
        [item_code]: false,
      }));

      // If item exists in cart, remove it directly
      if (existingCartItem) {
        setCart((prev) => prev.filter((item) => item.item_code !== item_code));
      }

      return;
    }

    // Update product quantities for UI
    setProductQuantities((prev) => ({
      ...prev,
      [item_code]: Math.max(1, quantity),
    }));

    // If item exists in cart, update it
    if (existingCartItem) {
      // First, update the cart with the new quantity
      const updatedCart = cart.map((item) =>
        item.item_code === item_code
          ? {
              ...item,
              customer_code: selectedClientCode,
              quantity,
              totalPrice: quantity * item.unitpriceHT,
            }
          : item
      );

      // Update the cart state with new quantity
      setCart(updatedCart);
      await applyPricing(updatedCart);
    }
  };

  const clearCart = () => {
    setCart([]);
    pendingOrderRef.current = null;
    // Reset all product quantities to 0
    setProductQuantities({});

    // Hide all quantity controls
    setShowQuantityControls({});
    
    // Reset payment forms
    setPaymentMethodForm("none");
    setDigitalPhone("");
    setDigitalProvider("MOMO");
    setCardReference("");
    setCashReceived("");
  };

  const processTransaction = async (
    paymentMethod: "cash" | "card" | "digital"
  ) => {
    if (cart.length === 0) return;
    if (!currentUser) return;
    if (!cashSession) {
      toast.error("Caisse fermée", { description: "Ouvrez la caisse avant d'enregistrer un paiement." });
      setOpenCashDialog(true);
      return;
    }

    setIsProcessing(true);

    try {
      // Reuse the order number if the order was already created on a previous attempt
      const orderId = pendingOrderRef.current ?? `POS${selectedSitetCode}${Date.now()}`;

      const transaction: Transaction = {
        id: orderId,
        items: cart.map((item) => ({
          ...item,
          unitpriceHT: item.unitpriceHT || item.product.base_price,
          totalpriceHT: item.totalpriceHT || item.unitpriceHT * item.quantity,
          totalPrice:
            item.totalPrice || item.unitpriceHT * item.quantity * 1.08,
        })),
        subtotal: subtotalTTC,
        subtotalHT: subtotalHT,
        tax: subtotalTTC - subtotalHT,
        total: valoTotalTTc,
        totalHT: valoTotalHT,
        paymentMethod,
        timestamp: new Date(),
        status: "completed" as const,
        customerCode: selectedClientCode,
        receiptData: {
          storeName: siteInfo?.name ?? selectedSitetCode,
          storeAddress: siteInfo
            ? [...siteInfo.address_lines, [siteInfo.postal_code, siteInfo.city].filter(Boolean).join(" "), siteInfo.country_name ?? siteInfo.country]
                .filter(Boolean)
                .join("\n")
            : "",
          storePhone: siteInfo?.phone ? `Tél. ${siteInfo.phone}` : "",
          storeVatNumber: siteInfo?.vat_number ?? undefined,
          cashierName: currentUser.name,
          terminalId: selectedSitetCode,
          receiptNumber: orderId,
          currency: getCurrencyByCode(selectedCurrencyCode)?.symbol || "",
          valoTotalHT,
          valoTotalTTC: valoTotalTTc,
        },
        customer: undefined,
      };

      console.log("Transaction processed:", transaction);

      const request_data: SalesOrder = {
        num_comd: transaction.id,
        site_vente: selectedSitetCode,
        currency: selectedCurrencyCode,
        client_comd: selectedClientCode,
        client_payeur: selectTierCode,
        client_facture: selectTierCode,
        total_ht: transaction.subtotalHT,
        total_ttc: transaction.subtotal,
        valo_ht: transaction.totalHT,
        valo_ttc: transaction.total,
        price_type: 1,
        regime_taxe: selectTaxeCode,
        comd_type: selectedCommandType || "SON",
        user_code: currentUser.code,
        site_stock: siteExoeditionCode || selectedSitetCode,
        ligne: transaction.items?.map((item) => ({
          num_comd: transaction.id,
          item_code: item.item_code,
          quantity: item.quantity,
          prix_brut: item.product.base_price,
          prix_net_ht: item.unitpriceHT,
          prix_net_ttc: item.unitPriceTTC,
          free_items: item.free_items,
          description: item.product.describtion,
          unit: item.product.unit_sales,
          tax_code: item.tax_code,
        })),
      };

      console.log("Request data for order creation:", request_data);

      // 1) Write the order (SORDER) unless it already exists from a failed attempt
      if (!pendingOrderRef.current) {
        const response_order = await createSalseOrder(request_data);
        console.log("Log[0] ====> ", response_order);
        if (!response_order.success) {
          setIsProcessing(false);
          return;
        }
        pendingOrderRef.current = orderId;
      }

      // 2) Register the payment the customer already made
      const paymentResponse = await processPayment({
        orderId,
        amount: valoTotalTTc,
        method: paymentMethod,
        currency: selectedCurrencyCode,
        customerCode: selectedClientCode,
        userCode: currentUser.code,
        site: selectedSitetCode,
        ...(paymentMethod === "cash" && cashReceived
          ? { amountTendered: Number(cashReceived) }
          : {}),
        ...(paymentMethod === "card" && cardReference
          ? { reference: cardReference }
          : {}),
        ...(paymentMethod === "digital"
          ? { phone: digitalPhone, provider: digitalProvider as "MOMO" | "OM" }
          : {}),
      });

      if (!paymentResponse.success || !paymentResponse.data) {
        toast.error("Paiement non enregistré", {
          description: `${paymentResponse.error ?? "Erreur inconnue"} — commande ${orderId}. Corrigez et confirmez à nouveau.`,
        });
        setIsProcessing(false);
        return;
      }

      const payment = paymentResponse.data;
      transaction.receiptData = {
        ...transaction.receiptData!,
        receiptNumber: payment.transactionId,
        change: payment.change ?? undefined,
        amountTendered: payment.amountTendered ?? undefined,
        paymentReference: payment.reference ?? payment.phone ?? undefined,
      };
      pendingOrderRef.current = null;
      refreshCashSession(selectedSitetCode || undefined);

      toast.success("Paiement enregistré", {
        description: `${payment.transactionId} · ${getCurrencyByCode(selectedCurrencyCode)?.symbol ?? ""}${payment.amount.toFixed(2)}${
          payment.change ? ` · monnaie ${payment.change.toFixed(2)}` : ""
        }`,
      });

      // Add to transaction history
      setTransactionHistory((prev) => [toHistoryEntry(payment), ...prev]);

      // Clear cart and reset product quantities/controls
      clearCart(); // This now handles both cart and product quantity reset
      setIsCartOpen(false);

      // Show transaction confirmation with receipt options
      setCompletedTransaction(transaction);

      setIsProcessing(false);
    } catch (error) {
      console.error("Transaction failed:", error);
      toast.error("La transaction a échoué", {
        description:
          error instanceof Error ? error.message : "Erreur inconnue",
      });
      setIsProcessing(false);
    }
  };

  // Store identity for receipts and the open cash session follow the sales site
  useEffect(() => {
    loadSiteInfo(selectedSitetCode || undefined);
    refreshCashSession(selectedSitetCode || undefined);
  }, [selectedSitetCode, loadSiteInfo, refreshCashSession]);

  // Today's registered payments survive a reload / app restart
  useEffect(() => {
    const loadTodaysPayments = async () => {
      const response = await fetchPayments({ day: todayIso() });
      if (response.success && response.data) {
        setTransactionHistory(response.data.map(toHistoryEntry));
      }
    };
    loadTodaysPayments();
  }, []);


  useEffect(() => {
    const loadInitialData = async () => {
      console.log("[v0] Loading initial data from API...");
      setIsLoadingProducts(true);
      const productsResponse = await fetchProducts(siteExoeditionCode);
      if (productsResponse.success && productsResponse.data) {
        setProducts(productsResponse.data);
        console.log("[v0] Products loaded:", productsResponse.data.length);
      } else {
        setApiError(productsResponse.error || "Failed to load products");
        console.error("[v0] Error loading products:", productsResponse.error);
      }
      setIsLoadingProducts(false);
    };

    const loadingCurrency = async () => {
      try {
        const response = await fetchCommandCurrency(selectedClientCode);
        console.log("Fetched command currency:", response);
        setCurrency(response?.data?.code || "");
        if (response && response.success) {
          console.log("Tax regimes loaded:", response.data);
        }
      } catch (error) {
        console.error("Error loading clients:", error);
      }
    };

    const loadElementFacturation = async () => {
      const response = await fetchElementFacturation(selectedClientCode);
      setElementFacts(response.data || []);
      console.log("Element facturation", response);
    };
    if (siteExoeditionCode) loadInitialData();
    if (selectedClientCode) {
      loadElementFacturation();
      loadingCurrency();
    }
  }, [siteExoeditionCode, selectedClientCode]);

  const applyElementFact = (montant: number) => {
    if (elementFacts.length > 0) {
      elementFacts.forEach((element) => {
        // Majoration
        if (element.majmin == 1) {
          // Application d'un taux
          if (element.type == 3) {
            montant = montant * (1 + element.amount / 100);
          }
          // Application d'un montant
          else if (element.type == 1) {
            montant += element.amount;
          }
        }

        // Minoration
        else if (element.majmin == 2) {
          // Application d'un taux
          if (element.type == 3) {
            montant = montant * (1 - element.amount / 100);
          }
          // Application d'un montant
          else if (element.type == 1) {
            montant -= element.amount;
          }
        }
      });
    }

    return montant;
  };

  const handlePrintReceipt = () => {
    console.log(
      "[v0] Print receipt clicked, completedTransaction:",
      completedTransaction
    );
    if (!completedTransaction) {
      console.log("[v0] No completed transaction available for receipt");
      return;
    }
    console.log("[v0] Opening receipt generator");
    setShowReceiptGenerator(true);
  };

  const subtotalTTC = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const subtotalHT = cart.reduce((sum, item) => sum + item.totalpriceHT, 0);
  const tax = subtotalHT * 0.08;

  const valoTotalHT = applyElementFact(subtotalHT);
  const valoTotalTTc = applyElementFact(subtotalTTC);

  useEffect(() => {
    if (!selectedClientCode) return;
    const loadingTaxe = async () => {
      try {
        const response = await fetchTaxRegimes(selectedClientCode);
        console.log("Fetched tax regimes:", response);
        setTaxeCode(response?.data?.code || "");
        if (response && response.success) {
          console.log("Tax regimes loaded:", response.data);
        }
      } catch (error) {
        console.error("Error loading clients:", error);
      }
    };

    loadingTaxe();
  }, [selectedClientCode]);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSynchronization = async () => {
    try {
      setIsSyncing(true);
      const response = await synchronizeData();
      console.log("Data synchronized:", response);
    } catch (error) {
      console.error("Error synchronizing data:", error);
      setIsSyncing(false);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFolderSelect = async () => {
    if ("showDirectoryPicker" in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        setFolderPath(dirHandle.name);
      } catch (err) {
        console.log("Sélection du dossier annulée");
      }
    } else {
      alert(
        "La sélection de dossier n'est pas supportée par ce navigateur. Veuillez utiliser Chrome ou Edge."
      );
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "livraison":
        return <Livraison2 />;
      case "cash":
        return <CashSessionView site={selectedSitetCode} currency={selectedCurrencyCode || siteInfo?.currency || undefined} />;
      case "customers":
        return <CustomersContent onSelectForSale={() => setCurrentView("pos")} />;
      case "inventory":
        return <InventoryContent site={siteExoeditionCode || selectedSitetCode} />;
      case "history":
        return (
          <div className="space-y-6">
            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {transactionHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No transactions yet
                    </h3>
                    <p className="text-muted-foreground">
                      Start making sales to see transaction history
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactionHistory.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {transaction.id}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {transaction.timestamp.toLocaleString()} · Commande{" "}
                              {transaction.orderId}
                            </div>
                            {(transaction.reference ||
                              transaction.provider ||
                              transaction.change != null) && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {transaction.provider &&
                                  `${transaction.provider} ${transaction.phone ?? ""} `}
                                {transaction.reference &&
                                  `Réf. ${transaction.reference} `}
                                {transaction.change != null &&
                                  `Monnaie ${transaction.change.toFixed(2)}`}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">
                              {getCurrencyByCode(transaction.currency ?? selectedCurrencyCode)?.symbol ?? ""}
                              {transaction.total?.toFixed(2)}
                            </div>
                            <Badge variant="outline">
                              {transaction.paymentMethod}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      case "settings":
        return <SettingsForm site={selectedSitetCode} />;
      case "reports":
        return <ReportsContent site={selectedSitetCode || undefined} currency={selectedCurrencyCode || siteInfo?.currency || undefined} />;
      case "receipts":
        return <ReceiptsContent site={selectedSitetCode || undefined} />;
      default:
        return (
          <div className="space-y-6">
            <Card className="transition-all duration-200 hover:shadow-lg overflow-y-scroll h-screen">
              <CardHeader>
                <CardTitle className="flex flex-col items-start gap-2">
                  {/* Tabs */}
                  <Tabs
                    defaultValue={tabs[0].value}
                    className="max-w-xs w-full"
                  >
                    <TabsList className="p-1 h-auto bg-background gap-1 border">
                      {tabs.map((tab) => (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          <code className="text-[13px]">{tab.name}</code>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {tabs.map((tab) => (
                      <TabsContent key={tab.value} value={tab.value}>
                        <div className="flex items-center justify-between border gap-2 rounded-md px-4 py-4 w-fit">
                          {tab.content}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    <p>Product Catalog</p>
                  </div>
                  {isLoadingProducts && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <div className="ml-auto">
                    <Button
                      onClick={() => setIsCartOpen(true)}
                      className="relative transition-all duration-200 hover:scale-105"
                      variant={cart.length > 0 ? "default" : "outline"}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Cart ({cart.length})
                      {cart.length > 0 && (
                        <div className="absolute -top-1 -right-1">
                          <Sparkles className="h-3 w-3 text-yellow-500 animate-pulse" />
                        </div>
                      )}
                    </Button>
                  </div>
                </CardTitle>
                <div className="flex flex-col gap-4 relative">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un article ou scanner un code-barres…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleScan(searchTerm);
                        }
                      }}
                      className="pl-10 transition-all duration-200 focus:ring-2"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <SiteExpedition />
                    {categories?.map((category) => (
                      <Button
                        key={category}
                        variant={
                          selectedCategory === category ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="capitalize transition-all duration-200 hover:scale-105"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{filteredProducts.length} products found</span>
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="h-auto p-1"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              </CardHeader>

              {isLoadingProducts ? <div className="flex-1 justify-center items-center">
                <Loader speed={20} size={20} />
              </div>  :
                <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredProducts.map((product, index) => {
                    const stockStatus = getStockStatus(product.stock);
                    const quantity = productQuantities[product.item_code] || 1;
                    const showControls =
                      showQuantityControls[product.item_code];

                    return (
                      <Card
                        key={product.item_code}
                        className={`cursor-pointer transition-all duration-500 hover:shadow-lg animate-in zoom-in-95 ${
                          product.stock === 0
                            ? "opacity-100"
                            : "hover:scale-[1.02] hover:-translate-y-1"
                        }`}
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animationDuration: "500ms",
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="relative mb-3">
                            <ProductImage
                              item_code={product.item_code}
                              alt={product.describtion}
                              width={120}
                              height={120}
                              className="w-full h-50 object-fill rounded-md transition-transform duration-200 hover:scale-105"
                            />
                            {product.stock <= 10 && product.stock > 0 && (
                              <div className="absolute top-2 right-2 animate-pulse">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-sm leading-tight">
                                {product.describtion}
                              </h3>
                              <Badge
                                variant={stockStatus.variant}
                                className="ml-2 text-xs"
                              >
                                {product.stock}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                {/* {product.categorie} */}
                                {product.item_code}
                              </span>
                              <span
                                className={`text-xs font-medium ${stockStatus.color}`}
                              >
                                {stockStatus.label}
                              </span>
                            </div>

                            {showControls && (
                              <div className="flex items-center justify-between animate-in zoom-in-95 duration-500">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Quantity:
                                </span>
                                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 hover:bg-background transition-all duration-200 hover:scale-110 animate-in zoom-in-95 duration-300"
                                    onClick={() =>
                                      updateProductQuantity(
                                        product.item_code,
                                        quantity - 1
                                      )
                                    }
                                    style={{ animationDelay: "100ms" }}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <Input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) =>
                                      updateProductQuantity(
                                        product.item_code,
                                        Number.parseInt(e.target.value) || 0
                                      )
                                    }
                                    className="w-10 h-6 text-center border-0 bg-transparent text-xs font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none animate-in zoom-in-95 duration-300"
                                    min={0}
                                    style={{ animationDelay: "200ms" }}
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 hover:bg-background transition-all duration-200 hover:scale-110 animate-in zoom-in-95 duration-300"
                                    onClick={() =>
                                      updateProductQuantity(
                                        product.item_code,
                                        quantity + 1
                                      )
                                    }
                                    disabled={quantity >= 99}
                                    style={{ animationDelay: "300ms" }}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-2">
                              <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">
                                  {showControls ? "Total:" : "Price:"}
                                </span>
                                <div className="relative overflow-hidden">
                                  <span
                                    className={`inline-block transition-all duration-300 ease-in-out font-bold text-lg`}
                                  >
                                    {
                                      getCurrencyByCode(selectedCurrencyCode)
                                        ?.symbol
                                    }
                                    {showControls
                                      ? (
                                          product.base_price * quantity
                                        )?.toFixed(2)
                                      : product.base_price?.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              {!showControls && (
                                <Button
                                  size="sm"
                                  onClick={() => addToCart(product)}
                                  className="min-w-[80px] transition-all duration-200 hover:scale-105 animate-in zoom-in-95 duration-300"
                                  data-product-id={product.item_code}
                                >
                                  Add to Cart
                                </Button>
                              )}
                            </div>

                            {product.barcode && (
                              <div className="text-xs text-muted-foreground font-mono">
                                {product.barcode}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No products found
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "No products available in this category"}
                    </p>
                  </div>
                )}
              </CardContent>}
            </Card>
          </div>
        );
    }
  };

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        transactionHistory={transactionHistory}
        onOpenCash={() => setOpenCashDialog(true)}
        onCloseCash={() => setCloseCashDialog(true)}
        currency={selectedCurrencyCode || siteInfo?.currency || undefined}
      />
      <OpenCashDialog
        open={openCashDialog}
        onOpenChange={setOpenCashDialog}
        site={selectedSitetCode}
        currency={selectedCurrencyCode || siteInfo?.currency || undefined}
      />
      <CloseCashDialog open={closeCashDialog} onOpenChange={setCloseCashDialog} session={cashSession} />

      <div className="flex-1 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-foreground">
                {currentView === "pos"
                  ? "Point de vente"
                  : currentView === "cash"
                  ? "Caisse"
                  : currentView === "livraison"
                  ? "Gestion des Livraisons"
                  : currentView === "history"
                  ? "Historique des transactions"
                  : currentView === "customers"
                  ? "Clients"
                  : currentView === "inventory"
                  ? "Inventaire"
                  : currentView === "reports"
                  ? "Rapports"
                  : currentView === "receipts"
                  ? "Reçus"
                  : currentView === "settings"
                  ? "Paramètres"
                  : "Point de vente"}
              </h1>

              <div className="flex items-center gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSynchronization}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      {isSyncing ? (
                        <SwirlingEffectSpinner />
                      ) : (
                        <Repeat className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Synchronisé</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                      className="transition-all duration-200 hover:scale-105"
                    >
                      {theme === "dark" ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p> Mode d'éclairage </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="flex items-center justify-between flex-1">
              <p className="text-muted-foreground">
                {currentView === "pos"
                  ? `${siteInfo?.name ?? selectedSitetCode}${currentUser ? ` · ${currentUser.name}` : ""}`
                  : currentView === "cash"
                  ? "Ouverture, fermeture, apports et retraits d'espèces"
                  : currentView === "livraison"
                  ? "Gérez vos livraisons"
                  : currentView === "history"
                  ? "Historique des transactions"
                  : currentView === "customers"
                  ? "Clients"
                  : currentView === "inventory"
                  ? "Inventaire"
                  : currentView === "reports"
                  ? "Rapports"
                  : currentView === "receipts"
                  ? "Reçus"
                  : currentView === "settings"
                  ? "Paramètres"
                  : "Point de vente"}
              </p>
              {transactionHistory.length > 0 && currentView === "pos" && (
                <div className="text-sm text-muted-foreground">
                  Today's transactions: {transactionHistory.length} | Total: $
                  {transactionHistory
                    .reduce((sum, t) => sum + t.total, 0)
                    ?.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {renderCurrentView()}

          {/* Cart Dialog */}
          <Dialog open={isCartOpen} onOpenChange={() => {}}>
            <DialogContent
              className="min-w-xl max-h-[90vh] overflow-scroll"
              onPointerDownOutside={(e) => e.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Cart ({cart.length})
                    {cart.length > 0 && (
                      <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCartOpen(false)}
                    className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 max-h-[calc(90vh-120px)]">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Cart is empty</p>
                    <p className="text-sm text-muted-foreground">
                      Add products to get started
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="max-h-64 space-y-3 overflow-y-auto">
                      {cart.map((item, index) => {
                        // const isFree =
                        //   item.unitpriceHT === 0 || item.totalpriceHT === 0;
                        const currencySymbol =
                          getCurrencyByCode(selectedCurrencyCode)?.symbol;

                        return (
                          <div
                            key={item.item_code}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-muted animate-in slide-in-from-right-200`}
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="relative">
                              <ProductImage
                                item_code={item.item_code}
                                alt={item.product.describtion}
                                width={40}
                                height={40}
                                className="w-10 h-10 object-cover rounded transition-transform duration-200 hover:scale-110"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm truncate">
                                  {item.product.describtion}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-muted-foreground">
                                  (
                                  <>
                                    {currencySymbol}
                                    {item.unitpriceHT?.toFixed(2)} each
                                  </>
                                  )
                                </p>
                                {item.item_code && (
                                  <span className="text-xs text-muted-foreground bg-gray-100 px-1.5 py-0.5 rounded dark:bg-gray-800">
                                    #{item.item_code}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0 bg-transparent transition-all duration-200 hover:scale-110"
                                onClick={() =>
                                  updateQuantity(
                                    item.item_code,
                                    item.quantity - 1
                                  )
                                }
                              >
                                -
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0 bg-transparent transition-all duration-200 hover:scale-110"
                                onClick={() =>
                                  updateQuantity(
                                    item.item_code,
                                    item.quantity + 1
                                  )
                                }
                              >
                                +
                              </Button>
                            </div>

                            {/* Improved price display */}
                            <div className="text-right min-w-[80px]">
                              <div className="text-xs text-muted-foreground">
                                HT: (
                                <span className="font-medium">
                                  {currencySymbol}
                                  {item.totalpriceHT?.toFixed(2)}
                                </span>
                                )
                              </div>
                              <div className="text-sm font-semibold">
                                TTC: (
                                <span>
                                  {currencySymbol}
                                  {item.totalPrice?.toFixed(2)}
                                </span>
                                )
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary Section with improved layout */}
                    <div className="space-y-4 border-t pt-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <Calculator className="h-4 w-4" />
                          Récapitulatif de la commande
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2 dark:bg-gray-900">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Sous-total (HT):
                            </span>
                            <span className="font-medium">
                              {getCurrencyByCode(selectedCurrencyCode)?.symbol}
                              {subtotalHT?.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Tax included:
                            </span>
                            <span className="font-medium">
                              {getCurrencyByCode(selectedCurrencyCode)?.symbol}
                              {(subtotalTTC - subtotalHT)?.toFixed(2)}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total (TTC):</span>
                            <span className="text-primary">
                              {getCurrencyByCode(selectedCurrencyCode)?.symbol}
                              {subtotalTTC?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Valorisation
                        </h3>
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 space-y-2 dark:from-green-950 dark:to-emerald-950">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Value (HT):
                            </span>
                            <span className="font-medium text-gray-600">
                              {getCurrencyByCode(selectedCurrencyCode)?.symbol}
                              {valoTotalHT?.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xl font-bold">
                            <span>Value (TTC):</span>
                            <span className="text-green-600">
                              {getCurrencyByCode(selectedCurrencyCode)?.symbol}
                              {valoTotalTTc?.toFixed(2)}
                            </span>
                          </div>
                          {valoTotalTTc > subtotalTTC && (
                            <div className="text-xs text-green-600 font-medium">
                              You save:{" "}
                              {getCurrencyByCode(selectedCurrencyCode)?.symbol}
                              {(valoTotalTTc - subtotalTTC)?.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Payment buttons and forms */}
                    <div className="space-y-2 pt-4">
                      {paymentMethodForm === "none" && (
                        <>
                          <Button
                            className="w-full transition-all duration-200 hover:scale-105"
                            size="lg"
                            onClick={() => setPaymentMethodForm("card")}
                            disabled={isProcessing}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            {isProcessing ? (
                              <>
                                <SwirlingEffectSpinner />
                                Processing...
                              </>
                            ) : (
                              "Pay with Card"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full bg-transparent transition-all duration-200 hover:scale-105"
                            size="lg"
                            onClick={() => setPaymentMethodForm("cash")}
                            disabled={isProcessing}
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Pay with Cash
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full bg-transparent transition-all duration-200 hover:scale-105"
                            size="lg"
                            onClick={() => setPaymentMethodForm("digital")}
                            disabled={isProcessing}
                          >
                            <Smartphone className="h-4 w-4 mr-2" />
                            Digital Payment
                          </Button>

                          {cart.length > 0 && (
                            <Button
                              variant="ghost"
                              className="w-full transition-all duration-200 hover:scale-105"
                              size="sm"
                              onClick={clearCart}
                              disabled={isProcessing}
                            >
                              Clear Cart
                            </Button>
                          )}
                        </>
                      )}

                      {paymentMethodForm === "digital" && (
                        <div className="space-y-4 p-4 border rounded-lg bg-background">
                          <h4 className="font-semibold text-mg flex items-center"><Smartphone className="h-4 w-4 mr-2"/> Digital Payment</h4>
                          <div className="space-y-2">
                            <Label>Provider</Label>
                            <div className="flex gap-2">
                              <Button 
                                variant={digitalProvider === "MOMO" ? "default" : "outline"} 
                                onClick={() => setDigitalProvider("MOMO")}
                                className="flex-1"
                              >
                                MTN MoMo
                              </Button>
                              <Button 
                                variant={digitalProvider === "OM" ? "default" : "outline"} 
                                onClick={() => setDigitalProvider("OM")}
                                className="flex-1"
                              >
                                Orange Money
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input 
                              type="tel" 
                              placeholder="+237 XXX XXX XXX" 
                              value={digitalPhone} 
                              onChange={(e) => setDigitalPhone(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2 font-bold text-lg">
                            <span>Amount to Pay:</span>
                            <span className="text-primary">{getCurrencyByCode(selectedCurrencyCode)?.symbol}{(valoTotalTTc)?.toFixed(2)}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setPaymentMethodForm("none")} className="flex-1">Back</Button>
                            <Button onClick={() => processTransaction("digital")} disabled={isProcessing || !digitalPhone} className="flex-1">
                              {isProcessing ? "Processing..." : "Confirm"}
                            </Button>
                          </div>
                        </div>
                      )}

                      {paymentMethodForm === "card" && (
                        <div className="space-y-4 p-4 border rounded-lg bg-background">
                          <h4 className="font-semibold text-mg flex items-center"><CreditCard className="h-4 w-4 mr-2"/> Card Payment</h4>
                          <div className="space-y-2">
                            <Label>Approval / Reference Number (Optional)</Label>
                            <Input 
                              type="text" 
                              placeholder="Terminal Receipt Ref..." 
                              value={cardReference} 
                              onChange={(e) => setCardReference(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2 font-bold text-lg">
                            <span>Amount to Pay:</span>
                            <span className="text-primary">{getCurrencyByCode(selectedCurrencyCode)?.symbol}{(valoTotalTTc)?.toFixed(2)}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setPaymentMethodForm("none")} className="flex-1">Back</Button>
                            <Button onClick={() => processTransaction("card")} disabled={isProcessing} className="flex-1">
                              {isProcessing ? "Processing..." : "Confirm"}
                            </Button>
                          </div>
                        </div>
                      )}

                      {paymentMethodForm === "cash" && (
                        <div className="space-y-4 p-4 border rounded-lg bg-background">
                          <h4 className="font-semibold text-mg flex items-center"><DollarSign className="h-4 w-4 mr-2"/> Cash Payment</h4>
                          <div className="space-y-2">
                            <Label>Amount Received</Label>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              value={cashReceived} 
                              onChange={(e) => setCashReceived(e.target.value)}
                            />
                          </div>
                          <div className="flex justify-between font-bold text-lg">
                            <span>Amount to Pay:</span>
                            <span className="text-primary">{getCurrencyByCode(selectedCurrencyCode)?.symbol}{(valoTotalTTc)?.toFixed(2)}</span>
                          </div>
                          {Number(cashReceived) >= valoTotalTTc && (
                            <div className="flex justify-between font-bold text-lg text-green-600">
                              <span>Change Due:</span>
                              <span>{getCurrencyByCode(selectedCurrencyCode)?.symbol}{(Number(cashReceived) - valoTotalTTc).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setPaymentMethodForm("none")} className="flex-1">Back</Button>
                            <Button onClick={() => processTransaction("cash")} disabled={isProcessing || (cashReceived ? Number(cashReceived) < valoTotalTTc : false)} className="flex-1">
                              {isProcessing ? "Processing..." : "Confirm"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <EnhancedTransactionConfirmation
            transaction={completedTransaction}
            isOpen={!!completedTransaction}
            onClose={() => setCompletedTransaction(null)}
            onPrintReceipt={handlePrintReceipt}
          />

          <EnhancedReceiptGenerator
            transaction={completedTransaction}
            isOpen={showReceiptGenerator}
            onClose={() => setShowReceiptGenerator(false)}
          />
        </div>
      </div>
    </div>
  );
}
