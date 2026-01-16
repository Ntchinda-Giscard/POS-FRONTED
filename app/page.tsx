"use client";

import { useEffect, useState } from "react";
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
  fetchCommandCurrency,
  fetchElementFacturation,
  fetchPricing,
  fetchProducts,
  fetchTaxRegimes,
  fetchTiers,
  PricingRequest,
  synchronizeData,
  Tax,
} from "@/lib/api";
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
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
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
  const [cashDrawerOpen, setCashDrawerOpen] = useState(false);
  const [cashDrawerAmount, setCashDrawerAmount] = useState(200.0);

  const { theme, setTheme } = useTheme();
  const siteExoeditionCode = useSiteExpeditionStore(
    (state) => state.selectedadressExpeditionCode
  );

  const { selectTaxeCode, setTaxeCode } = useTaxeStore();
  const { selectedCurrencyCode, setCurrency } = useCurrencyStore();
  const { selectTierCode, setTierCode } = useTierStore();

  useEffect(() => {
    console.log("Selected client code changed:", selectedClientCode);
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
      product?.item_code?.includes(searchTerm);
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

    setCart((prev) => {
      const existingItem = prev.find(
        (item) => item.item_code === product.item_code
      );
      if (existingItem) {
        return prev.map((item) =>
          item.item_code === product.item_code
            ? {
                ...item,
                customer_code: selectedClientCode,
                quantity: item.quantity + quantity,
                totalPrice: (item.quantity + quantity) * item.unitpriceHT,
                totalpriceHT: (item.quantity + quantity) * item.unitpriceHT,
                unitPriceTTC: item.unitpriceHT * 1, // Default, will be updated later
              }
            : item
        );
      }
      return [
        ...prev,
        {
          customer_code: selectedClientCode,
          item_code: product.item_code,
          product,
          quantity,
          unitPriceTTC: product.base_price * 1, // Default, will be updated later
          unitpriceHT: product.base_price,
          totalPrice: product.base_price * quantity,
          totalpriceHT: product.base_price * quantity,
        },
      ];
    });
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

    // Create pricing requests using the updated cart
    const mappedRequests: PricingRequest[] = updatedCart.map(
      (item: CartItem) => ({
        item_code: item.item_code,
        quantity: item.quantity.toString(),
        customer_code: item.customer_code,
        currency: selectedCurrencyCode,
        unit_of_measure: item.product.unit_sales ?? "",
      })
    );

    const mappedTaxRequests = updatedCart.map((item: CartItem) => ({
      item_code: item.item_code,
      regime_taxe_tiers: selectTaxeCode,
    }));

    try {
      console.log("Fetching taxes for:", mappedTaxRequests);
      console.log("Fetching pricing for:", mappedRequests);

      const pricingResponse = await fetchPricing(mappedRequests);
      const taxResponse = await fetchAppliedTaxes(mappedTaxRequests);
      console.log("Applied taxes response: ====>", taxResponse.data);
      console.log("Pricing response: ====>", pricingResponse.data);

      // Update cart with the pricing response
      setCart((prevCart) =>
        prevCart.map((cartItem) => {
          // Find the corresponding pricing data for this cart item
          const pricingData = pricingResponse.data?.find(
            (priceItem: any) => priceItem.item_code === cartItem.item_code
          );

          const taxData = taxResponse.data?.find(
            (taxItem: Tax) => taxItem.item_code === cartItem.item_code
          );

          if (pricingData) {
            // Check if backend pricing is zero or null/undefined
            const backendUnitPrice = pricingData.prix_net;
            const backendTotalPrice = pricingData.total_HT;
            const backendGrossPrice = pricingData.prix_brut;

            // Check if all backend pricing values are zero or null/undefined
            const hasValidBackendPricing =
              (backendUnitPrice && backendUnitPrice > 0) ||
              (backendTotalPrice && backendTotalPrice > 0) ||
              (backendGrossPrice && backendGrossPrice > 0);

            // Use backend pricing if any value is greater than 0, otherwise fallback to base price
            const finalUnitPrice =
              hasValidBackendPricing && backendUnitPrice > 0
                ? backendUnitPrice
                : cartItem.product.base_price;

            const finalTotalPrice =
              hasValidBackendPricing && backendTotalPrice > 0
                ? backendTotalPrice
                : finalUnitPrice * cartItem.quantity;

            console.log(
              `Item ${cartItem.item_code}: Backend prices - net: ${backendUnitPrice}, total: ${backendTotalPrice}, gross: ${backendGrossPrice}, Using unit price: ${finalUnitPrice}`
            );

            return {
              ...cartItem,
              unitpriceHT: finalUnitPrice,
              unitPriceTTC:
                finalUnitPrice * (taxData ? 1 + taxData.taux / 100 : 1),
              totalPrice:
                finalTotalPrice * (taxData ? 1 + taxData.taux / 100 : 1),
              totalpriceHT: finalTotalPrice,
              free_items: pricingData.gratuit,
            };
          }

          // If no pricing data found, keep existing prices
          return cartItem;
        })
      );
    } catch (error) {
      console.error("Error fetching pricing:", error);
      // Handle error appropriately - maybe show a toast notification
    }
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

      // Update the cart state withn new quantity
      setCart(updatedCart);

      // Create pricing requests using the updated cart
      const mappedRequests = updatedCart.map((item: CartItem) => ({
        item_code: item.item_code,
        quantity: item.quantity.toString(),
        customer_code: item.customer_code,
        currency: selectedCurrencyCode,
        unit_of_measure: item.product.unit_sales ?? "",
      }));

      const mappedTaxRequests = updatedCart.map((item: CartItem) => ({
        item_code: item.item_code,
        regime_taxe_tiers: selectTaxeCode,
      }));

      try {
        console.log("Fetching pricing for:", mappedRequests);
        const pricingResponse = await fetchPricing(mappedRequests);
        const taxResponse = await fetchAppliedTaxes(mappedTaxRequests);
        console.log("Applied taxes response: ====>", taxResponse.data);
        console.log("Pricing response: ====>", pricingResponse.data);

        // Update cart with the pricing response
        setCart((prevCart) =>
          prevCart.map((cartItem) => {
            const pricingData = pricingResponse.data?.find(
              (priceItem: any) => priceItem.item_code === cartItem.item_code
            );

            const taxData = taxResponse.data?.find(
              (taxItem: Tax) => taxItem.item_code === cartItem.item_code
            );

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

              console.log(
                `Item ${cartItem.item_code}: Backend prices - net: ${backendUnitPrice}, total: ${backendTotalPrice}, gross: ${backendGrossPrice}, Using unit price: ${finalUnitPrice}`
              );

              return {
                ...cartItem,
                unitpriceHT: finalUnitPrice,
                unitPriceTTC:
                  finalUnitPrice * (taxData ? 1 + taxData.taux / 100 : 1),
                totalPrice:
                  finalTotalPrice * (taxData ? 1 + taxData.taux / 100 : 1),
                totalpriceHT: finalTotalPrice,
              };
            }

            return cartItem;
          })
        );
      } catch (error) {
        console.error("Error fetching pricing:", error);
      }
    }
  };

  const clearCart = () => {
    setCart([]);
    // Reset all product quantities to 0
    setProductQuantities({});

    // Hide all quantity controls
    setShowQuantityControls({});
  };

  const processTransaction = async (
    paymentMethod: "cash" | "card" | "digital"
  ) => {
    if (cart.length === 0) return;

    setIsProcessing(true);

    try {
      // Simulate processing
      // await new Promise((resolve) => setTimeout(resolve, 1500));

      const transaction: Transaction = {
        id: `TXN-${Date.now()}`,
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
          storeName: "Your Store Name",
          storeAddress: "Store Address Line 1\nStore Address Line 2",
          storePhone: "Phone: +237 XXX XXX XXX",
          cashierName: "Cashier Name",
          terminalId: "TERM-001",
          receiptNumber: `RCP-${Date.now()}`,
          currency: getCurrencyByCode(selectedCurrencyCode)?.symbol || "$",
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
        valo_ttc: transaction.totalHT,
        price_type: 1,
        regime_taxe: selectTaxeCode,
        comd_type: "SOH",
        ligne: transaction.items?.map((item) => ({
          num_comd: transaction.id,
          item_code: item.item_code,
          quantity: item.quantity,
          prix_net_ht: item.unitpriceHT,
          prix_net_ttc: item.unitPriceTTC,
          free_items: item.free_items,
        })),
      };

      console.log("Request data for order creation:", request_data);

      // Simulate saving to the database
      const response_order = await createSalseOrder(request_data);

      console.log("Log[0] ====> ", response_order);

      // Add to transaction history
      setTransactionHistory((prev) => [transaction, ...prev]);

      // Clear cart and reset product quantities/controls
      clearCart(); // This now handles both cart and product quantity reset
      setIsCartOpen(false);

      // Show transaction confirmation with receipt options
      setCompletedTransaction(transaction);

      setIsProcessing(false);
    } catch (error) {
      console.error("Transaction failed:", error);
      setIsProcessing(false);
    }
  };


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
    loadElementFacturation();
    loadInitialData();
    loadingCurrency();
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
      case "dashboard":
        return (
          <div className="space-y-6">
            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Sales Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Dashboard Coming Soon
                  </h3>
                  <p className="text-muted-foreground">
                    Advanced analytics and reporting features
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
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
                              Transaction #{transaction.id.slice(-6)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {transaction.timestamp.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">
                              ${transaction.total?.toFixed(2)}
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
        return <SettingsForm />;
      case "reports":
        return <ReportsContent />;
      case "receipts":
        return <ReceiptsContent />;
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
                      placeholder="Search products or scan barcode..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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

              {isLoadingProducts ? <Loader speed={20} /> :
                <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredProducts.map((product, index) => {
                    const stockStatus = getStockStatus(product.stock);
                    const quantity = productQuantities[product.item_code] || 1;
                    const showControls =
                      showQuantityControls[product.item_code];
                    // const productImage = product?.image?.toString();
                    console.log(` product image ${product?.image}`)
                    const src = `data:image/jpeg;base64,${product?.image}`;

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
                            <Image
                              src={
                                src ||
                                "/placeholder.svg?height=120&width=120&query=product"
                              }
                              alt={product.describtion}
                              width={120}
                              height={120}
                              className="w-full h-50 object-fill rounded-md bg-muted transition-transform duration-200 hover:scale-105"
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

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        transactionHistory={transactionHistory}
        cashDrawerOpen={cashDrawerOpen}
        onToggleCashDrawer={() => setCashDrawerOpen(!cashDrawerOpen)}
        cashDrawerAmount={cashDrawerAmount}
      />

      <div className="flex-1 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-foreground">
                {currentView === "pos"
                  ? "Point de vente"
                  : currentView === "dashboard"
                  ? "Tableau de bord des ventes"
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
                  ? "Point de vente"
                  : currentView === "dashboard"
                  ? "Tableau de bord des ventes"
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
                        const productImage = item?.product.image?.toString();
                        const src = `data:image/jpeg;base64,${productImage}`;

                        return (
                          <div
                            key={item.item_code}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-muted animate-in slide-in-from-right-200`}
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="relative">
                              <Image
                                src={
                                  src ||
                                  "/placeholder.svg?height=40&width=40&query=product"
                                }
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

                    {/* Payment buttons */}
                    <div className="space-y-2 pt-4">
                      <Button
                        className="w-full transition-all duration-200 hover:scale-105"
                        size="lg"
                        onClick={() => processTransaction("card")}
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
                        onClick={() => processTransaction("cash")}
                        disabled={isProcessing}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Pay with Cash
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent transition-all duration-200 hover:scale-105"
                        size="lg"
                        onClick={() => processTransaction("digital")}
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
